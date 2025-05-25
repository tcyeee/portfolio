import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
    plugins: [tailwindcss()]
  }
});