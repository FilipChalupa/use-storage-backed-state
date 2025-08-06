import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	root: 'demo',
	base: 'use-storage-backed-state/',
	build: {
		outDir: '../demo-dist',
		emptyOutDir: true,
	},
	plugins: [react()],
})
