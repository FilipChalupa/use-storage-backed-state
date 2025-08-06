import type { FunctionComponent } from 'react'
import { Counter } from './Counter'
import { Sliders } from './Sliders'
import { Tabs } from './Tabs'

export const App: FunctionComponent = () => {
	return (
		<>
			<h1>useStorageBackedState</h1>
			<p>
				To demonstrate the benefits of using a storage-backed state management
				solution it is recommended to open two tabs of this website to see them
				getting synchronized or try to reload the page to see the state
				persisting.{' '}
				<button
					onClick={() => {
						window.location.reload()
					}}
				>
					reload page 🔃
				</button>
			</p>
			<Counter />
			<Tabs />
			<Sliders />
		</>
	)
}
