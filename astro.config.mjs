import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import articleIndexIntegration from './scripts/astro-article-index-integration.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), articleIndexIntegration()],
  output: 'static',
});

