# useStorageBackedState [![npm](https://img.shields.io/npm/v/use-storage-backed-state.svg)](https://www.npmjs.com/package/use-storage-backed-state) ![npm type definitions](https://img.shields.io/npm/types/use-storage-backed-state.svg)

Custom React hook for state management like `useState` but persisted to `localStorage`. Check interactive [demo](http://filipchalupa.cz/use-storage-backed-state/).

![example](https://raw.githubusercontent.com/FilipChalupa/use-storage-backed-state/HEAD/screencast.gif)

## Installation

```bash
npm install use-storage-backed-state
```

## How to use

```jsx
import React from 'react'
import { useStorageBackedState } from 'use-storage-backed-state'

export const MyComponent = () => {
	const [count, setCount] = useStorageBackedState({
		key: 'count',
		defaultValue: 0,
	})

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

## Notes

- Stores data in `localStorage`.

- Works with `sessionStorage` too.

  ```jsx
  useStorageBackedState({
  	// …
  	storage: sessionStorage
  })
  ```

- Realtime synchronization between multiple uses with the same `key`. Even across tabs.

- You can opt out from storage and synchronization by passing `null` to `storage` option.

  ```jsx
  const [count, setCount] = useStorageBackedState({
		key: 'local-count',
		initialValue: 1,
		storage: null
	})
  ```
