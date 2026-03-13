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
    sveltekit(),
  ],
});
