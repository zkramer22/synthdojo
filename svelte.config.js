// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: { 
        adapter: adapter({
            fallback: 'index.html' // This ensures dynamic routes are handled as a SPA
        }),
        paths: {
            base: process.env.NODE_ENV === 'production' ? '/synthdojo' : '',
        }
    },
	onwarn: (warning, handler) => {
		if (warning.code === "a11y-no-static-element-interactions") return;
	},
};

export default config;
