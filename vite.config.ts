import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcss from './postcss.config.js';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss
	},
	server: {
		hmr: {
			protocol: 'ws', // Use 'ws' for WebSocket, or 'wss' for Secure WebSocket
			host: 'localhost', // Specify the host
			port: 3000, // Specify the port
			overlay: true // Show error overlay in the browser
		},
		proxy: {
			// '/samplevideo': {
			// 	target: 'https://www.w3schools.com/html/mov_bbb.mp4',
			// 	changeOrigin: true,
			// 	rewrite: (path) => path.replace(/^\/samplevideo/, '')
			// }
		},
		host: '0.0.0.0',
		port: 3000,
		fs: {
			// Allow serving files from the 'static' directory
			allow: ['static']
		}
	}
});
