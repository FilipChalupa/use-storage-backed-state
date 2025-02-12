import { listenable } from 'custom-listenable'
import {
	useCallback,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'

// @TODO: when transitioning from localStorage to in-memory storage, use last stored value

// @TODO: add option to provide a custom serializer/deserializer
// @TODO: add option to provide a custom data integrity checker

type ChangeListenable = ReturnType<typeof listenable<void>>
const changeListenables = new Map<string, ChangeListenable>()
const createListener = (key: null | string) => {
	const changeListenable: ChangeListenable = (() => {
		if (key === null) {
			return listenable()
		}
		const result = changeListenables.get(key) ?? listenable()
		changeListenables.set(key, result)
		return result
	})()
	const listen = (onChange: () => void) => {
		changeListenable.addListener(onChange)
		window.addEventListener('storage', onChange) // @TODO: check if the value for specific key has changed and not other
		return {
			unsubscribe: () => {
				changeListenable.removeListener(onChange)
				window.removeEventListener('storage', onChange)
			},
		}
	}
	return { emit: changeListenable.emit, listen }
}

// @TODO: this interface is very rough and not well thought out.
export const observe = (key: string, onChange: () => void) => {
	const { listen } = createListener(key)
	listen(onChange)
}

// @TODO: hook to listenable so the new value is broadcasted
export const setStorageBackedValue = (
	key: string,
	newValue: unknown,
	storage: Storage = localStorage,
) => {
	storage.setItem(key, JSON.stringify(newValue))
}

export const useStorageBackedState = <T>(
	initialValue: T | (() => T),
	key: string | null = null,
	storage: Storage | null | undefined = 'localStorage' in globalThis
		? localStorage
		: null,
) => {
	const [trulyInitialValue] = useState(initialValue)
	const inMemoryStorage = useMemo(() => {
		let value = trulyInitialValue
		return {
			get: () => value,
			set: (newValue: T) => {
				value = newValue
			},
		}
	}, [trulyInitialValue])
	const internalStorage = useMemo(() => {
		const core: { get: () => T; set: (newValue: T) => void } = (() => {
			if (key === null || storage === null || storage === undefined) {
				return inMemoryStorage
			}
			const cache: {
				rawValue: string | null
				value: T
			} = {
				rawValue: null,
				value: trulyInitialValue,
			}
			return {
				get: () => {
					const rawValue = storage.getItem(key)
					if (rawValue === null) {
						return trulyInitialValue
					}
					if (cache.rawValue === rawValue) {
						return cache.value
					}
					try {
						const value = (() => {
							if (rawValue === 'undefined') {
								return undefined
							}
							return JSON.parse(rawValue)
						})() as T // @TODO: validate data in storage
						cache.rawValue = rawValue
						cache.value = value
						return value
					} catch (error) {
						console.error(
							'Corrupted storage data. Falling back to initialState.',
						)
						console.error(error)
					}
					return trulyInitialValue
				},
				set: (newValue) => storage.setItem(key, JSON.stringify(newValue)),
			}
		})()
		const { emit, listen } = createListener(key)
		const set = (newValue: T) => {
			core.set(newValue)
			emit()
		}
		return { get: core.get, set, listen }
	}, [key, storage, trulyInitialValue, inMemoryStorage])
	const subscribe = useCallback(
		(onStoreChange: () => void) =>
			internalStorage.listen(onStoreChange).unsubscribe,
		[internalStorage],
	)
	const getSnapshot = useCallback(
		() => internalStorage.get(),
		[internalStorage],
	)
	const getServerSnapshot = useCallback(
		() => trulyInitialValue,
		[trulyInitialValue],
	)
	const value = useSyncExternalStore<T>(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	)

	const valueRef = useRef(value)
	valueRef.current = value
	const setValue = useCallback(
		(newValue: T | ((oldValue: T) => T)) => {
			internalStorage.set(
				newValue instanceof Function ? newValue(valueRef.current) : newValue,
			)
		},
		[internalStorage],
	)

	return [value, setValue] as const
}
