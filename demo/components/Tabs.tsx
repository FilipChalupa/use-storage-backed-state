import type { FunctionComponent } from 'react'
import { useStorageBackedState } from '../../src'

const tabs = ['main', 'secondary', 'other'] as const

type Tab = (typeof tabs)[number]

export const Tabs: FunctionComponent = () => {
	const [activeTab, setActiveTab] = useStorageBackedState<Tab>({
		key: 'tabs',
		defaultValue: 'main',
		stringify: (value) => value.substring(0, 1),
		parse: (value) => {
			const tab = tabs.find((tab) => tab.startsWith(value))
			if (tab) {
				return tab
			}
			throw new Error(`Unexpected tab value: ${value}`)
		},
	})

	return (
		<section>
			<h2>Tabs</h2>
			<p>
				Example with custom <code>stringify</code> and <code>parse</code>{' '}
				functions.
			</p>
			{tabs.map((tab) => (
				<button
					key={tab}
					onClick={() => {
						setActiveTab(tab)
					}}
					style={{
						color: activeTab === tab ? 'black' : 'initial',
						backgroundColor: activeTab === tab ? 'lightblue' : 'initial',
					}}
				>
					{tab}
				</button>
			))}
		</section>
	)
}
