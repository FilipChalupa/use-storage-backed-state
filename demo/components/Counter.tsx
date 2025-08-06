import type { FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src/legacy'

export const Counter: FunctionComponent = () => {
	const [count, setCount] = useStorageBackedState(0, 'count')

	return (
		<section>
			<h2>Counter</h2>
			<p>
				Value: <output>{count}</output>
			</p>
			<button
				onClick={() => {
					setCount(count + 1)
				}}
			>
				increment ➕
			</button>{' '}
			<button
				onClick={() => {
					setCount(count - 1)
				}}
			>
				decrement ➖
			</button>{' '}
			<button
				onClick={() => {
					window.location.reload()
				}}
			>
				reload page 🔃
			</button>
		</section>
	)
}
