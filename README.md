# useStorageBackedState [![npm](https://img.shields.io/npm/v/use-storage-backed-state.svg)](https://www.npmjs.com/package/use-storage-backed-state) ![npm type definitions](https://img.shields.io/npm/types/use-storage-backed-state.svg)

Custom React hook for storage backed persisted state. Check interactive [demo](https://codesandbox.io/p/sandbox/use-storage-backed-state-8skmqm?file=%2Fsrc%2FApp.js).

## Installation

```bash
npm install use-storage-backed-state
```

## How to use

```jsx
import React from 'react'
import { useStorageBackedState } from 'use-storage-backed-state'

export const MyComponent = () => {
	// 0: initialState
	// 'count': localStorage key
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
```

![example](https://raw.githubusercontent.com/FilipChalupa/use-storage-backed-state/HEAD/screencast.gif)

## Notes

- Stores data in `localStorage`.

- Works with `sessionStorage` too.

  ```jsx
  useStorageBackedState(…, …, sessionStorage)
  ```

- Realtime synchronization between multiple uses with the same `key`. Even across tabs.

- You can opt out from storage and synchronization by passing `null` as the second argument or by omitting the `key` altogether. `useStorageBackedState` will then behave similarly like `useState` in that case.

  ```jsx
  const [count, setCount] = useStorageBackedState(1)
  ```

  ```jsx
  const [storeState, setStoreState] = useState(false)
  const [count, setCount] = useStorageBackedState(
  	1,
  	storeState ? 'count' : null,
  )
  ```
