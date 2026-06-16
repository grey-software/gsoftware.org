import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        impact: './impact.html',
        lineage: './lineage.html',
        credits: './credits.html',
      },
    },
  },
})
