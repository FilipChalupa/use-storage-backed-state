import type { FunctionComponent } from 'react'
import { removeStorageBackedValue, useStorageBackedState } from '../../src/'

const key = 'counter'

export const Counter: FunctionComponent = () => {
	const [count, setCount] = useStorageBackedState({
		key,
		defaultValue: 0,
	})

	return (
		<section>
			<h2>Counter</h2>
			<p>
				Value: <output>{count}</output>
			</p>
			<button
				type="button"
				onClick={() => {
					setCount(count + 1)
				}}
			>
				increment ➕
			</button>{' '}
			<button
				type="button"
				onClick={() => {
					setCount(count - 1)
				}}
			>
				decrement ➖
			</button>{' '}
			<button
				type="button"
				onClick={() => {
					removeStorageBackedValue({
						key,
					})
				}}
			>
				reset 🛑
			</button>
		</section>
	)
}
