import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcss from './postcss.config.js';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss
	},
	server: {
		proxy: {
			// '/samplevideo': {
			// 	target: 'https://www.w3schools.com/html/mov_bbb.mp4',
			// 	changeOrigin: true,
			// 	rewrite: (path) => path.replace(/^\/samplevideo/, '')
			// }
		},
		host: '0.0.0.0',
		port: 3000
	}
});
