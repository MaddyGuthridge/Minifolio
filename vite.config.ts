import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  ssr:{
    noExternal: [
      // Workaround for broken import when running production build
      // https://github.com/atlassian/pragmatic-drag-and-drop/issues/27#issuecomment-2615335498
      "@atlaskit/pragmatic-drag-and-drop",
    ]
  },
  server: {
    port: parseInt(process.env.PORT as string),
    strictPort: true,
    host: process.env.HOST,
  },
  plugins: [
    sveltekit()
  ],
});
