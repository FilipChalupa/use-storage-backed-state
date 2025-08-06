import type { FunctionComponent } from 'react'
import { Counter } from './Counter'
import { Tabs } from './Tabs'

export const App: FunctionComponent = () => {
	return (
		<>
			<h1>useStorageBackedState</h1>
			<Counter />
			<Tabs />
		</>
	)
}
