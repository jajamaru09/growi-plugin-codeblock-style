import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      input: [resolve(__dirname, 'client-entry.tsx')],
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
        format: 'iife',
      },
    },
  },
});
