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

This is a **static portfolio site** built with Astro 5 + React 18, styled with Tailwind CSS 3 + SCSS, deployed as pure static output.

### Content Pipeline

Content lives in Markdown files under `public/articles/` and `public/projects/`. At build time, two scripts (`scripts/generate-article-index.js`, `scripts/generate-project-index.js`) parse frontmatter and generate JSON index files (`src/config/cache/articles.json`, `src/config/cache/projects.json`). These cached indexes are imported at runtime for listing pages; full markdown is parsed on-demand for detail pages via `src/utils/markdown.ts` (uses `marked` + KaTeX for math).

**If you add or modify articles/projects, run the index generation scripts** (or `pnpm build`) before the changes appear in listings.

### Key Files

| File | Purpose |
|------|---------|
| `src/config/index.ts` | All personal info, projects array, articles array, apps, category enums — the single source of truth for site content |
| `src/domain.ts` | TypeScript interfaces: `Project`, `Article`, `IndexApp` |
| `src/layouts/Layout.astro` | Root HTML template; includes dark mode detection script and Umami analytics |
| `src/pages/[slug].astro` | Dynamic routes for article/project detail pages |

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
