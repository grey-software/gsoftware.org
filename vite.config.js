import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
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
