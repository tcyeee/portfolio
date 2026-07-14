# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:4321
pnpm build      # Production build (runs index generation scripts first via prebuild)
pnpm preview    # Preview production build
pnpm generate-article-index   # Regenerate src/config/cache/articles.json
pnpm generate-project-index   # Regenerate src/config/cache/projects.json
```

No linting or test commands are configured.

> On a fresh checkout, run `pnpm generate-article-index && pnpm generate-project-index` before `pnpm dev` to regenerate the content index cache (files in `src/config/cache/` are not tracked by git).

## Architecture Overview

This is a **static portfolio site** built with Astro 6 + React 18, styled with Tailwind CSS 3 + SCSS, deployed as pure static output (`output: 'static'`, `site: https://tcyeee.top`).

### Content Pipeline

Content lives in Markdown files under `public/articles/` and `public/projects/`. At build time, two scripts (`scripts/generate-article-index.js`, `scripts/generate-project-index.js`) parse frontmatter and generate JSON index files (`src/config/cache/articles.json`, `src/config/cache/projects.json`). These cached indexes are imported at runtime for listing pages; full markdown is parsed on-demand for detail pages via `src/utils/markdown.ts` (uses `marked` + KaTeX for math).

**If you add or modify articles/projects, run the index generation scripts** (or `pnpm build`) before the changes appear in listings.

### Key Files

| File | Purpose |
|------|---------|
| `src/config/index.ts` | Personal info, category enums, and the app-cloud display config; re-exports `projects`/`articles` (from `cache/*.json`) and `apps` (from `index_app.json`) — the single source of truth for site content |
| `src/config/index_app.json` | Home-page app list data (loaded as `apps`) |
| `src/config/generate-config.js` | Single source for content dir + index-file paths shared by the detail routes and the index-generation scripts (see its header for the manual-sync caveat) |
| `src/domain.ts` | TypeScript interfaces: `Project`, `Article`, `IndexApp` |
| `src/layouts/Layout.astro` | Root HTML template; includes dark mode detection script and self-hosted GoatCounter analytics (first-party `/count` proxied to `tcyeee.stats.viii.me`) |
| `src/pages/article/[slug].astro`, `src/pages/project/[slug].astro` | Dynamic detail routes (`getStaticPaths` from the cached indexes; markdown parsed on demand) |

### Deployment

Pushing to the **`prod`** branch (not `main`) triggers `.github/workflows/deploy.yml`: it builds on the runner (Node 24, pnpm), then `rsync --delete`s `dist/` to an nginx-in-Docker web root on the server over SSH, and notifies WeChat via ServerChan. `main` is the working branch; deploys happen from `prod`.

### Component Model

- `.astro` components handle layout and static rendering (Header, Footer, ThemeToggle, Layout, MarkdownContent)
- `.tsx` React components handle interactivity (ProjectCard, AppList, TagFilter, AppIcon)
- Dark mode is class-based (`dark` on `<html>`), toggled via ThemeToggle and persisted in `localStorage`

### Styling Conventions

- Tailwind utility classes are primary
- Prettier config: `printWidth: 130`, single quotes, no semicolons, `bracketSameLine: true`
- Custom primary color palette (sky blue) defined in `tailwind.config.mjs`
- Dark mode via `dark:` variants (Tailwind `darkMode: 'class'`)
- SVG icons defined inline in `src/styles/icon.scss`
