import React, { useCallback, useEffect, useMemo, useState } from 'react'

// @TODO: register CustomEvent on window type
const customThisTabStorageEventName = 'this-tab-storage'

type StateOrFunction<T> = T | ((value?: T) => T)

export const useStorageBackedState = <State>(
	initialState: StateOrFunction<State>,
	key: string,
	storage = 'localStorage' in globalThis ? localStorage : undefined // localStorage nebo sessionStorage
): [State, (value: State) => void] => {
	if (!storage) {
		const [state, setState] = useState(initialState)
		return [state, setState]
	}

	// Řeší první render na clientu po SSR
	const [isFirstRender, setIsFirstRender] = useState(true)
	useEffect(() => {
		setIsFirstRender(false)
	}, [])

	const localInitialState: State = useMemo(
		() =>
			initialState instanceof Function ? initialState(state) : initialState,
		[initialState]
	)

	// Přichystá interní stav. Pokud je to potřeba, načte poslední hodnotu z localStorage nebo použije dodanou v proměnné initialState
	const [rawState, setRawState] = useState(() =>
		loadJSON(
			storage,
			key,
			localInitialState instanceof Function
				? localInitialState(state)
				: localInitialState
		)
	) as [string, React.Dispatch<React.SetStateAction<string>>]

	// Při prvním renderu komponenty přidá posluchače událostí
	useEffect(() => {
		// Funkce pro zpracování události změny v localStorage
		const onChange = (event: Event) => {
			// Vyjmeme z události klíč pro data a novou hodnotu dat
			const { key: eventKey, newValue }: { key: string; newValue: string } =
				event instanceof CustomEvent ? event.detail : event
			// Zkontrolujeme, jestli se změnily data, která nás zajímají
			if (eventKey === key) {
				setRawState(missingDataCheck(newValue, localInitialState))
			}
		}

		// Přidání posluchaču
		window.addEventListener('storage', onChange)
		window.addEventListener(customThisTabStorageEventName, onChange)

		// Odebrání posluchačů po odebrání komponenty ze stránky
		return () => {
			window.removeEventListener('storage', onChange)
			window.removeEventListener(customThisTabStorageEventName, onChange)
		}
	}, [key, storage])

	// Do proměnné state vytáhneme data z localStorage. Pomocí hooku useMemo optimalizujeme výkon a data zpracováváme pouze v případě, že jsou jiné než při předchozím renderu
	const state = useMemo((): State => {
		if (isFirstRender === false) {
			// Pomocí try a catch zkusíme převést data z jsonu do původní struktury
			try {
				return JSON.parse(rawState)
			} catch (error) {
				// Pokud se převod nepovede, zapíšeme do konzole, že data jsou ve špatném formátu
				console.error(
					'Corrupted localStorage data. Falling back to initialState'
				)
				console.error(error)
			}
		}
		// Vrátíme počáteční data, pokud selhal převod z jsonu nebo poprvé renderujeme
		return localInitialState
	}, [rawState, isFirstRender])

	// Funkce pro změnu stavu, která ukládá do localStorage a doupozorní všechny komponenty, že se stav změnil
	const setState = useCallback(
		(value: StateOrFunction<State>) => {
			// Stejně jako useState i useStorageBackedState podporuje ve value funkci pro práci s předchozí hodnotou
			const valueToStore = JSON.stringify(
				value instanceof Function ? value(state) : value
			)
			// V localStorage můžou být jako hodnoty jen řetězce. Proto převedeme data (value) do jsonu
			saveJSON(storage, key, valueToStore)
			// Uložení do localStorage upozorňuje jen ostatní taby. Vytvoříme vlastní událost, která upozorní i tab, ve kterém zrovna jsme
			window.dispatchEvent(
				new CustomEvent(customThisTabStorageEventName, {
					detail: {
						key,
						newValue: valueToStore,
					},
				})
			)
		},
		[key, state, storage]
	)

	return [state, setState]
}

// Funkce pro čtení z localStorage. Vrací počáteční hodnotu, pokud v localStorage pod daným klíčem ještě nejsou žádná data
const loadJSON = <State>(
	storage: Storage,
	key: string,
	fallbackState: State
) => {
	const data = storage.getItem(key)
	return missingDataCheck(data, fallbackState)
}

// Vrací počáteční hodnotu, pokud jsou data prázdná
const missingDataCheck = <State>(data: string | null, fallbackState: State) => {
	// Data se rovnají null, pokud v localStorage ještě žádná nejsou
	if (data === null) {
		return JSON.stringify(fallbackState)
	}
	return data
}

// Ukládá do localStorage
const saveJSON = (storage: Storage, key: string, value: string) => {
	try {
		storage.setItem(key, value)
	} catch (error) {
		console.error(error)
	}
}
