![](/public/banner.png)

<p align="center">
	<img src="https://img.shields.io/badge/📩-tcyeee@outlook.com-red">
	<!-- last commit -->
	<img src="https://img.shields.io/github/last-commit/tcyeee/portfolio">
	<!-- license -->
	<img src="https://img.shields.io/github/license/tcyeee/portfolio">
	<!-- stars -->
	<img src="https://img.shields.io/github/stars/tcyeee/portfolio">
</p>

<div align="center"><a href="i18n/README.zh.md">中文</a> ｜ English</div><br><br>

Responsive portfolio built with Astro + React. It showcases projects, articles, and social links with categories, tags, and demo/download links.

![](/public/frame.png)

## Tech Stack
- Framework: Astro (with React components)
- Styling: Tailwind CSS + SCSS
- Package manager: pnpm
- Language/Build: TypeScript, ESM

## Quick Start
> Requirements: Node.js 18+, pnpm 8+

```bash
pnpm install
pnpm dev       # local dev, default http://localhost:4321
pnpm build     # production build
```

## Project Structure
```
portfolio/
├─ public/                 # Static assets (images, icons, etc.)
├─ public/articles/        # Markdown articles (for index generation)
├─ public/projects/        # Markdown projects (for index generation)
├─ scripts/                # Helper scripts
│  ├─ generate-article-index.js
│  └─ generate-project-index.js
├─ src/
│  ├─ components/          # React/Astro components
│  ├─ config/              # Data & config (includes cache/ indexes)
│  ├─ layouts/             # Page layouts
│  ├─ pages/               # Astro routes
│  └─ styles/              # Global styles & icons
└─ astro.config.mjs        # Astro config
```

## Config & Data
- Personal info, projects/articles/app data: `src/config/index.ts`
- Icon styles and inline SVG: `src/styles/icon.scss`
- Articles: `public/articles/`, index output `src/config/cache/articles.json`
- Projects: `public/projects/`, index output `src/config/cache/projects.json`
- Project category mappings: `ProjectCategory`, `categoryLabels`, `categoryColors` in `src/config/index.ts`

## Index Scripts
- Auto (prebuild): `generate-article-index`, `generate-project-index`
- Manual (either):
  ```bash
  pnpm run generate-article-index
  pnpm run generate-project-index
  ```
- To adjust directories/output/summary length, edit `scripts/generate-article-index.js` / `scripts/generate-project-index.js` or related config, and keep import paths in `src/config/index.ts` in sync (Astro static import limitation).

## Deployment
Build artifacts live in `dist/` and can be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

