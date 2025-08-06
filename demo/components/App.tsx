import type { FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src'

export const App: FunctionComponent = () => {
	const [count, setCount] = useStorageBackedState(0, 'count')

	return (
		<section>
			<h1>
				Value: <output>{count}</output>
			</h1>
			<button
				onClick={() => {
					setCount(count + 1)
				}}
			>
				increment
			</button>
			<button
				onClick={() => {
					setCount(count - 1)
				}}
			>
				decrement
			</button>
		</section>
	)
}
