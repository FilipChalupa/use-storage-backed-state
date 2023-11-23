import { useCallback, useRef, useSyncExternalStore } from 'react'

// @TODO: allow initial value as function
// @TODO: don't overuse CustomEvent - it is unnecessary window spam

const customThisTabStorageEventName = 'this-tab-storage'

type StateOrFunction<T> = T | ((value?: T) => T)

const stateOrFunctionToState = <T>(initialState: StateOrFunction<T>) =>
	initialState instanceof Function ? initialState() : initialState

export const useStorageBackedState = <T>(
	initialValue: StateOrFunction<T>,
	key: string,
	storage = 'localStorage' in globalThis ? localStorage : undefined
) => {
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
	const getSnapshot = useCallback(() => {
		if (!storage) {
			throw new Error('Storage not available')
		}
		const value = storage.getItem(key)
		if (value === null) {
			return stateOrFunctionToState(initialValue)
		}
		try {
			return JSON.parse(value) as T // @TODO: validate data in storage
		} catch (error) {
			console.error('Corrupted storage data. Falling back to initialState')
			console.error(error)
		}
		return stateOrFunctionToState(initialValue)
	}, [initialValue, key, storage])
	const getServerSnapshot = useCallback(
		() => stateOrFunctionToState(initialValue),
		[initialValue]
	)
	const value = useSyncExternalStore<T>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	const valueRef = useRef(value)
	valueRef.current = value
	const setValue = useCallback(
		(newValue: T | ((oldValue: T) => T)) => {
			if (!storage) {
				throw new Error('Storage not available')
			}
			storage.setItem(
				key,
				JSON.stringify(
					newValue instanceof Function ? newValue(valueRef.current) : newValue
				)
			)
			window.dispatchEvent(
				new CustomEvent(customThisTabStorageEventName, {
					detail: {
						key,
					},
				})
			)
		},
		[key, storage]
	)

	return [value, setValue] as const
}
