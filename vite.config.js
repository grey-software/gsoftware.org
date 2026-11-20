import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about/index.html',
        impact: './impact.html',
        lineage: './lineage.html',
        credits: './credits.html',
        notFound: './404.html',
      },
    },
  },
})
