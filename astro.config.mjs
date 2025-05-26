import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import path from 'path';

export default defineConfig({
  site: 'https://tcyeee.top',

  integrations: [
      mdx(), 
      sitemap()
  ],
  devToolbar:{
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': path.resolve('./src/components'),
        '@layouts': path.resolve('./src/layouts'),
        '@styles': path.resolve('./src/styles'),
        '@content': path.resolve('./src/content'),
        '@assets': path.resolve('./src/assets'),
        '@config': path.resolve('./src/config.ts')
      }
    }
  }
});