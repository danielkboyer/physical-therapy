import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: [
      { find: '@pt-app/shared-ui', replacement: path.resolve(__dirname, '../shared-ui/src') },
      { find: '@', replacement: path.resolve(__dirname, '../shared-ui/src') },
      { find: /^~/, replacement: path.resolve(__dirname, './src') },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
      },
    },
  },
  base: './',
});
