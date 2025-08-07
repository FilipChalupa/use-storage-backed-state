import { type FunctionComponent, useMemo, useRef, useState } from 'react'
import { useStorageBackedState } from '../../src'

export const FastFingers: FunctionComponent = () => {
	const [key, setKey] = useState<
		'fast-fingers' | 'slow-stubs' | 'lazy-pinkies' | 'none'
	>('fast-fingers')
	const [storage, setStorage] = useState<
		'localStorage' | 'sessionStorage' | 'none'
	>('localStorage')
	const [keyStrokes, setKeyStrokes] = useStorageBackedState<null | {
		text: string
		firstStrokeTimestamp: number
		lastStrokeTimestamp: number
	}>({
		key: key === 'none' ? null : key,
		defaultValue: null,
		storage:
			storage === 'localStorage'
				? localStorage
				: storage === 'sessionStorage'
					? sessionStorage
					: null,
	})

	const characterPerMinute = useMemo(() => {
		if (!keyStrokes) {
			return null
		}
		if (keyStrokes.firstStrokeTimestamp === keyStrokes.lastStrokeTimestamp) {
			return 1
		}
		return Math.ceil(
			keyStrokes.text.length /
				((keyStrokes.lastStrokeTimestamp - keyStrokes.firstStrokeTimestamp) /
					1000 /
					60),
		)
	}, [keyStrokes])

	const ref = useRef<HTMLTextAreaElement>(null)

	return (
		<>
			<p>
				Example with <code>key</code> and <code>storage</code> changed on the
				fly.
			</p>
			<p>
				Characters per minute:{' '}
				<output>{characterPerMinute ?? 'start typing'}</output>
			</p>
			<textarea
				ref={ref}
				placeholder="Type fast to increment the counter"
				value={keyStrokes?.text ?? ''}
				onChange={(event) => {
					setKeyStrokes((previous) => {
						const now = Date.now()
						return {
							text: event.target.value,
							firstStrokeTimestamp: previous
								? previous.firstStrokeTimestamp
								: now,
							lastStrokeTimestamp: now,
						}
					})
				}}
			/>
			<label>
				Storage:{' '}
				<select
					value={storage}
					onChange={(event) => {
						setStorage(
							event.target.value as 'localStorage' | 'sessionStorage' | 'none',
						)
					}}
				>
					<option value="localStorage">localStorage</option>
					<option value="sessionStorage">sessionStorage</option>
					<option value="none">no storage</option>
				</select>
			</label>{' '}
			<label>
				Key:{' '}
				<select
					value={key}
					onChange={(event) => {
						setKey(
							event.target.value as
								| 'fast-fingers'
								| 'slow-stubs'
								| 'lazy-pinkies',
						)
					}}
				>
					<option value="fast-fingers">fast-fingers</option>
					<option value="slow-stubs">slow-stubs</option>
					<option value="lazy-pinkies">lazy-pinkies</option>
					<option value="none">no key</option>
				</select>
			</label>{' '}
			<button
				type="button"
				onClick={() => {
					setKeyStrokes(null)
					ref.current?.focus()
				}}
			>
				Reset
			</button>
		</>
	)
}
