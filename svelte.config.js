import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Import aliases
		// https://kit.svelte.dev/docs/configuration#alias
		alias: {
			// Allow importing our alias definitions
			"$components": "src/components/",
			"$endpoints": "src/endpoints",
		},
		// https://stackoverflow.com/a/75438617/6335363
		version: {
			name: process.env.npm_package_version,
		},
		// Disable origin checking, so that form submission works when using an API client.
		// FIXME: This is definitely a security issue, and so I should find a workaround at some point.
		csrf: {
			checkOrigin: false,
		},
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapterNode(),
	}
};

export default config;
