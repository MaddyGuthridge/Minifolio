import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import commonjs from 'vite-plugin-commonjs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

try {
  process.loadEnvFile('.env');
} catch (e) {
  console.log('Could not load .env file. Default host and port will be used.');
}

export default defineConfig({
  ssr:{
    noExternal: [
      // Workaround for broken import when running production build
      // https://github.com/atlassian/pragmatic-drag-and-drop/issues/27#issuecomment-2615335498
      "@atlaskit/pragmatic-drag-and-drop",
    ]
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT as string) : undefined,
    strictPort: true,
    host: process.env.HOST,
  },
  plugins: [
    commonjs(),
    sveltekit({
      // Consult https://kit.svelte.dev/docs/integrations#preprocessors
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      compilerOptions: { runes: true },
      csrf: {
        // Disable origin checking, so that form submission works when using an API client.
        // FIXME: This is definitely a security issue, and so I should find a workaround at some point.
        trustedOrigins: ['*'],
      },
      // https://stackoverflow.com/a/75438617/6335363
      version: { name: process.env.npm_package_version },

      // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
      // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
      // See https://kit.svelte.dev/docs/adapters for more information about adapters.
      adapter: adapterNode()
    })
  ]
});
