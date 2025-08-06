import { useMemo, useRef, type FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src'

export const FastFingers: FunctionComponent = () => {
	const [keyStrokes, setKeyStrokes] = useStorageBackedState<null | {
		text: string
		firstStrokeTimestamp: number
		lastStrokeTimestamp: number
	}>({
		key: 'fast-fingers',
		defaultValue: null,
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
