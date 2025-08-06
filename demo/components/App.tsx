import type { FunctionComponent } from 'react'
import { Counter } from './Counter'

export const App: FunctionComponent = () => {
	return (
		<>
			<h1>useStorageBackedState</h1>
			<Counter />
		</>
	)
}
