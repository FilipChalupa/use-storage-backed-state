import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'

// @TODO: allow initial value as function
// @TODO: don't overuse CustomEvent - it is unnecessary window spam

const customThisTabStorageEventName = 'this-tab-storage'

type StateOrFunction<T> = T | ((value?: T) => T)

const stateOrFunctionToState = <T>(initialState: StateOrFunction<T>) =>
	initialState instanceof Function ? initialState() : initialState

export const useStorageBackedState = <T>(
	initialValue: StateOrFunction<T>,
	key: string | null = null,
	storage: Storage | null = 'localStorage' in globalThis ? localStorage : null
) => {
	const internalStorage = useMemo<{
		get: () => T
		set: (newValue: T) => void
	}>(() => {
		const initialValueCached = stateOrFunctionToState(initialValue)
		if (key === null || storage === null) {
			let value = initialValueCached
			return {
				get: () => value,
				set: (newValue) => {
					value = newValue
				},
			}
		}
		const cache: {
			rawValue: string | null
			value: T
		} = {
			rawValue: null,
			value: initialValueCached,
		}
		return {
			get: () => {
				const rawValue = storage.getItem(key)
				if (rawValue === null) {
					return initialValueCached
				}
				if (cache.rawValue === rawValue) {
					return cache.value
				}
				try {
					const value = JSON.parse(rawValue) as T // @TODO: validate data in storage
					cache.rawValue = rawValue
					cache.value = value
					return value
				} catch (error) {
					console.error('Corrupted storage data. Falling back to initialState.')
					console.error(error)
				}
				return initialValueCached
			},
			set: (newValue) => storage.setItem(key, JSON.stringify(newValue)),
		}
	}, [key, storage, initialValue])
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const handleCustomEvent = (event: Event) => {
				if (event instanceof CustomEvent && event.detail.key === key) {
					onStoreChange()
				}
			}
			window.addEventListener('storage', onStoreChange)
			window.addEventListener(customThisTabStorageEventName, handleCustomEvent)
			return () => {
				window.removeEventListener('storage', onStoreChange)
				window.removeEventListener(
					customThisTabStorageEventName,
					handleCustomEvent
				)
			}
		},
		[key]
	)
	const getSnapshot = useCallback(() => internalStorage.get(), [
		internalStorage,
	])
	const getServerSnapshot = useMemo(() => {
		const initialValueCached = stateOrFunctionToState(initialValue)
		return () => initialValueCached
	}, [initialValue])
	const value = useSyncExternalStore<T>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	const valueRef = useRef(value)
	valueRef.current = value
	const setValue = useCallback(
		(newValue: T | ((oldValue: T) => T)) => {
			internalStorage.set(
				newValue instanceof Function ? newValue(valueRef.current) : newValue
			)
			window.dispatchEvent(
				new CustomEvent(customThisTabStorageEventName, {
					detail: {
						key,
					},
				})
			)
		},
		[key, internalStorage]
	)

	return [value, setValue] as const
}
