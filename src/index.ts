import {
	useCallback,
	useId,
	useMemo,
	useRef,
	useSyncExternalStore,
} from 'react'

type Key = string
type Storage = globalThis.Storage | null
const defaultStorage = 'localStorage' in globalThis ? localStorage : null

// @TODO: maybe when transitioning from localStorage to in-memory storage, use last stored value
// @TODO: make default value optional

const runtimeStorage = new Map<Key, string>()

export const defaultParse = <Value>(value: string) => {
	if (value === 'undefined') {
		return undefined as Value
	}
	return JSON.parse(value) as Value
}
export const defaultStringify = <Value>(value: Value) => {
	return JSON.stringify(value)
}

const runtimeBroadcastChannels = new Map<
	Storage,
	Map<Key, Set<(value: string | null) => void>>
>()
const valueCache = new Map<Storage, Map<Key, { value: unknown }>>()

const broadcastRuntimeNewValue = (
	key: Key,
	value: string | null,
	storage: Storage,
) => {
	runtimeBroadcastChannels
		.get(storage)
		?.get(key)
		?.forEach((callback) => {
			callback(value)
		})
}

const subscribeNewValue = (
	key: Key,
	onChange: (value: string | null) => void,
	storage: Storage,
) => {
	const onChangeInternal = (value: string | null) => {
		valueCache.get(storage)?.delete(key)
		onChange(value)
	}
	const handleStorageChange = (event: StorageEvent) => {
		if (event.storageArea !== storage || event.key !== key) {
			return
		}
		onChangeInternal(event.newValue)
	}
	if (storage !== null) {
		window.addEventListener('storage', handleStorageChange)
	}
	const byStorageChannels =
		runtimeBroadcastChannels.get(storage) ??
		new Map<Key, Set<(value: string | null) => void>>()
	runtimeBroadcastChannels.set(storage, byStorageChannels)
	const byKeyChannels =
		byStorageChannels.get(key) ?? new Set<(value: string | null) => void>()
	byStorageChannels.set(key, byKeyChannels)
	byKeyChannels.add(onChangeInternal)

	const unsubscribe = () => {
		if (storage !== null) {
			window.removeEventListener('storage', handleStorageChange)
			runtimeBroadcastChannels.get(storage)?.get(key)?.delete(onChangeInternal)
		}
	}
	return { unsubscribe }
}

export const setStorageBackedValue = <Value>({
	key,
	value,
	storage = defaultStorage,
	stringify = defaultStringify,
}: {
	key: Key
	value: Value
	storage?: Storage
	stringify?: (value: Value) => string
}) => {
	const stringifiedValue = stringify(value)
	if (storage === null) {
		runtimeStorage.set(key, stringifiedValue)
	} else {
		storage.setItem(key, stringifiedValue)
	}
	broadcastRuntimeNewValue(key, stringifiedValue, storage)
}

export const getStorageBackedValue = (() => {
	const alreadyWarnedAboutMalformedData = new Map<Key, string>()
	return <Value>({
		key,
		defaultValue,
		storage = defaultStorage,
		parse = defaultParse,
	}: {
		key: Key
		defaultValue: Value
		storage?: Storage
		parse?: (value: string) => Value
	}): Value => {
		const cachedValue = valueCache.get(storage)?.get(key)
		if (cachedValue) {
			return cachedValue?.value as Value
		}
		const value = (() => {
			const rawValue = storage
				? storage.getItem(key)
				: (runtimeStorage.get(key) ?? null)
			if (rawValue === null) {
				return defaultValue
			}
			try {
				return parse(rawValue)
			} catch (error) {
				if (alreadyWarnedAboutMalformedData.get(key) !== rawValue) {
					alreadyWarnedAboutMalformedData.set(key, rawValue)
					console.error(
						`Malformed storage data for key ${key}. Falling back to defaultValue.\n${error}`,
					)
				}
				return defaultValue
			}
		})()

		const cacheByStorage =
			valueCache.get(storage) ?? new Map<Key, { value: unknown }>()
		valueCache.set(storage, cacheByStorage)
		cacheByStorage.set(key, { value })

		return value
	}
})()

export const removeStorageBackedValue = ({
	key,
	storage = defaultStorage,
}: {
	key: Key
	storage?: Storage
}) => {
	if (storage === null) {
		runtimeStorage.delete(key)
	} else {
		storage.removeItem(key)
	}
	broadcastRuntimeNewValue(key, null, storage)
}

export const subscribeStorageBackedValue = <Value>({
	key,
	defaultValue,
	storage = defaultStorage,
	parse = defaultParse,
	onChange,
}: {
	key: Key
	defaultValue: Value
	storage?: Storage
	parse?: (value: string) => Value
	onChange: (value: Value) => void
}) => {
	const onInternalChange = () => {
		onChange(
			getStorageBackedValue({
				key,
				defaultValue,
				storage,
				parse,
			}),
		)
	}
	const { unsubscribe } = subscribeNewValue(key, onInternalChange, storage)
	return { unsubscribe }
}

export const useStorageBackedState = <Value>({
	key,
	defaultValue,
	storage,
	parse = defaultParse,
	stringify = defaultStringify,
}: {
	key: Key | null
	defaultValue: Value | (() => Value)
	storage?: Storage
} & (
	| {
			parse?: undefined
			stringify?: undefined
	  }
	| {
			parse: (value: string) => Value
			stringify: (value: Value) => string
	  }
)) => {
	const fallbackKey = useId()
	const evaluatedKey = key ?? fallbackKey
	const evaluatedStorage = key === null ? null : (storage ?? defaultStorage)

	const evaluatedInitialValue = useMemo(
		() =>
			defaultValue instanceof Function
				? (defaultValue as () => Value)()
				: defaultValue,
		[defaultValue],
	)
	const subscribe = useCallback(
		(onStoreChange: () => void) =>
			subscribeStorageBackedValue({
				key: evaluatedKey,
				defaultValue: evaluatedInitialValue,
				storage: evaluatedStorage,
				parse,
				onChange: onStoreChange,
			}).unsubscribe,
		[evaluatedKey, evaluatedInitialValue, evaluatedStorage, parse],
	)
	const getSnapshot = useCallback(
		() =>
			getStorageBackedValue({
				key: evaluatedKey,
				defaultValue: evaluatedInitialValue,
				storage: evaluatedStorage,
				parse,
			}),
		[evaluatedKey, evaluatedInitialValue, evaluatedStorage, parse],
	)
	const getServerSnapshot = useCallback(
		() => evaluatedInitialValue,
		[evaluatedInitialValue],
	)

	const value = useSyncExternalStore<Value>(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	)

	const valueRef = useRef(value)
	valueRef.current = value
	const setValue = useCallback(
		(newValue: Value | ((oldValue: Value) => Value)) => {
			setStorageBackedValue({
				key: evaluatedKey,
				value:
					newValue instanceof Function ? newValue(valueRef.current) : newValue,
				storage: evaluatedStorage,
				stringify,
			})
		},
		[evaluatedKey, evaluatedStorage, stringify],
	)

	return [value, setValue] as const
}

export const storageBackedState = <Value>({
	key,
	defaultValue,
	storage = defaultStorage,
	parse = defaultParse,
	stringify = defaultStringify,
}: {
	key: Key
	defaultValue: Value
	storage?: Storage
} & (
	| {
			parse?: undefined
			stringify?: undefined
	  }
	| {
			parse: (value: string) => Value
			stringify: (value: Value) => string
	  }
)) => {
	return {
		use: () =>
			useStorageBackedState({ key, storage, defaultValue, parse, stringify }),
		set: (value: Value) =>
			setStorageBackedValue({ key, storage, value, stringify }),
		get: () => getStorageBackedValue({ key, storage, defaultValue, parse }),
		remove: () => removeStorageBackedValue({ key, storage }),
		subscribe: (onChange: (value: Value) => void) =>
			subscribeStorageBackedValue({
				key,
				storage,
				defaultValue,
				parse,
				onChange,
			}),
	}
}
