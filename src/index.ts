type Key = string
type Storage = globalThis.Storage | null
const defaultStorage = 'localStorage' in globalThis ? localStorage : null

// @TODO: make default value optional

export const defaultParse = <Value>(value: string) => {
	return JSON.parse(value) as Value
}
export const defaultStringify = <Value>(value: Value) => {
	return JSON.stringify(value)
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
	// @TODO
}

export const getStorageBackedValue = <Value>({
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
	// @TODO
	return defaultValue
}

export const removeStorageBackedValue = ({
	key,
	storage = defaultStorage,
}: {
	key: Key
	storage?: Storage
}) => {
	// @TODO
}

export const subscribeStorageBackedValue = <Value>({
	key,
	defaultValue,
	storage = defaultStorage,
	parse = defaultParse,
}: {
	key: Key
	defaultValue: Value
	storage?: Storage
	parse?: (value: string) => Value
}) => {
	// @TODO
	const unsubscribe = () => {
		// @TODO
	}
	return { unsubscribe }
}

export const useStorageBackedState = <Value>({
	key,
	defaultValue,
	storage = defaultStorage,
	parse = defaultParse,
	stringify = defaultStringify,
}: {
	key: Key
	defaultValue: Value
	storage?: Storage
	parse?: (value: string) => Value
	stringify?: (value: Value) => string
}) => {
	// @TODO
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
	parse?: (value: string) => Value
	stringify?: (value: Value) => string
}) => {
	return {
		use: () =>
			useStorageBackedState({ key, storage, defaultValue, parse, stringify }),
		set: (value: Value) =>
			setStorageBackedValue({ key, storage, value, stringify }),
		get: () => getStorageBackedValue({ key, storage, defaultValue, parse }),
		remove: () => removeStorageBackedValue({ key, storage }),
		subscribe: () =>
			subscribeStorageBackedValue({ key, storage, defaultValue, parse }),
	}
}
