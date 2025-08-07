import type { CSSProperties, FunctionComponent } from 'react'
import { storageBackedState } from '../../src'

const slider = storageBackedState({
	key: 'slider',
	defaultValue: 5,
})

export const Sliders: FunctionComponent = () => {
	return (
		<>
			<p>Example with hook used more than once on the same page.</p>
			<Value />
			<Slider accentColor="red" widthMultiplier={1} />
			<Slider accentColor="green" widthMultiplier={1.5} />
			<Slider accentColor="blue" widthMultiplier={2} />
		</>
	)
}

const Slider: FunctionComponent<{
	accentColor: string
	widthMultiplier: 1 | 1.5 | 2
}> = ({ accentColor, widthMultiplier }) => {
	const [value, setValue] = slider.use()

	return (
		<div style={{ accentColor } as CSSProperties}>
			<input
				type="range"
				min={0}
				max={10}
				value={value}
				onChange={(event) => setValue(Number(event.target.value))}
				style={{ width: `${50 * widthMultiplier}%` } as CSSProperties}
			/>
		</div>
	)
}

const Value: FunctionComponent = () => {
	const [value] = slider.use()

	return (
		<p>
			Value: <output>{value}</output>
		</p>
	)
}
