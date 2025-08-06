import { useMemo, useRef, useState, type FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src'

export const FastFingers: FunctionComponent = () => {
	const [storage, setStorage] = useState<
		'localStorage' | 'sessionStorage' | 'none'
	>('localStorage')
	const [keyStrokes, setKeyStrokes] = useStorageBackedState<null | {
		text: string
		firstStrokeTimestamp: number
		lastStrokeTimestamp: number
	}>({
		key: 'fast-fingers',
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
		<section>
			<h2>Fast fingers</h2>
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
			</select>{' '}
			<button
				onClick={() => {
					setKeyStrokes(null)
					ref.current?.focus()
				}}
			>
				Reset
			</button>
		</section>
	)
}
