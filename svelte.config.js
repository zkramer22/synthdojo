import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: { adapter: adapter() },
	onwarn: (warning, handler) => {
		if (warning.code === "a11y-no-static-element-interactions") return;
	},
};

export default config;
