import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcss from './postcss.config.js';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss
	},
	server: {
		host: '0.0.0.0',
		port: 3000
	}
});
