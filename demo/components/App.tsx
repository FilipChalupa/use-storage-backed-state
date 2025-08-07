import type { FunctionComponent, PropsWithChildren } from 'react'
import { Counter } from './Counter'
import { FastFingers } from './FastFingers'
import { Sliders } from './Sliders'
import { Tabs } from './Tabs'

export const App: FunctionComponent = () => {
	return (
		<>
			<h1>useStorageBackedState</h1>
			<p>
				To demonstrate the benefits of using a storage-backed state management
				solution it is recommended to open two tabs of this website to see them
				getting synchronized or try to reload the page to see the state
				persisting.{' '}
				<button
					type="button"
					onClick={() => {
						window.location.reload()
					}}
				>
					reload page 🔃
				</button>
			</p>
			<Example title="Counter" fileName="Counter">
				<Counter />
			</Example>
			<Example title="Tabs" fileName="Tabs">
				<Tabs />
			</Example>
			<Example title="Sliders" fileName="Sliders">
				<Sliders />
			</Example>
			<Example title="Fast fingers" fileName="FastFingers">
				<FastFingers />
			</Example>
		</>
	)
}

const Example: FunctionComponent<
	PropsWithChildren<{
		title: string
		fileName: string
	}>
> = ({ title, fileName, children }) => {
	return (
		<section>
			<h2>
				{title} (
				<a
					href={`https://github.com/FilipChalupa/use-storage-backed-state/blob/main/demo/components/${fileName}.tsx`}
				>
					code
				</a>
				)
			</h2>
			{children}
		</section>
	)
}
