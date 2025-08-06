import { useMemo, type FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src'

export const FastFingers: FunctionComponent = () => {
	const [keyStrokes, setKeyStrokes] = useStorageBackedState<
		Array<{
			character: string
			timestamp: number
		}>
	>({
		key: 'fast-fingers',
		defaultValue: [],
	})

	const characterPerMinute = useMemo(() => {
		const first = keyStrokes.at(0)
		const last = keyStrokes.at(-1)
		if (!first || !last || first === last) {
			return keyStrokes.length
		}
		return Math.ceil(
			keyStrokes.length / ((last.timestamp - first.timestamp) / 1000 / 60),
		)
	}, [keyStrokes])

	return (
		<section>
			<h2>Fast fingers</h2>
			<p>
				Characters per minute: <output>{characterPerMinute}</output>
			</p>
			<textarea
				placeholder="Type fast to increment the counter"
				value={keyStrokes.map(({ character }) => character).join('')}
				onChange={(event) => {
					const value = event.target.value
					setKeyStrokes((previous) => {
						const characters = value.split('')
						const newStrokes: typeof previous = []
						let matches = true
						const now = Date.now()
						characters.forEach((character, index) => {
							const current = matches ? previous.at(index) : undefined
							matches = matches && !current
							newStrokes.push(
								current ?? {
									character,
									timestamp: now,
								},
							)
						})
						return newStrokes
					})
				}}
			/>
			<button onClick={() => setKeyStrokes([])}>Reset</button>
		</section>
	)
}
