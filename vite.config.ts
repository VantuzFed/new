import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    cssMinify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
