# Code Review Fixes — Design Spec

**Date:** 2026-03-26
**Scope:** Fix all issues identified in full-project code review
**Execution order:** Critical → Important → Suggestions

---

## Batch 1: Critical

### C1. HTML Sanitization on Markdown Output

**File:** `src/utils/markdown.ts`
**Dependency:** Add `isomorphic-dompurify` (+ `@types/dompurify`)

After the existing `marked` + KaTeX processing pipeline, wrap the final return value with `DOMPurify.sanitize()`. No changes to the rendering pipeline itself — sanitization is applied only at the output boundary.

```ts
import DOMPurify from 'isomorphic-dompurify'
// ...at end of renderMarkdown:
return DOMPurify.sanitize(html)
```

### C2. Slug Path Traversal Prevention

**Files:** `src/pages/project/[slug].astro`, `src/pages/article/[slug].astro`

Before the fallback `fs.readFile` call, validate that `slugFromParams` matches `/^[a-z0-9-_]+$/i`. If invalid, redirect to the listing page.

```ts
if (!/^[a-z0-9-_]+$/i.test(slugFromParams)) {
  return Astro.redirect('/projects') // or '/articles'
}
```

---

## Batch 2: Important

### I1. Replace `window` Global with CustomEvent

**Problem:** `articles.astro` and `projects.astro` attach filter functions to `window`, and `TagFilter.tsx` reads them back — creating implicit coupling with no type safety.

**Solution:**
- `TagFilter.tsx`: on tag selection, dispatch `window.dispatchEvent(new CustomEvent('tag-filter', { detail: selectedTag }))`; remove all `window.filterArticles` / `window.filterProjects` reads
- `articles.astro` + `projects.astro`: remove the `window.filterArticles = ...` / `window.filterProjects = ...` assignments; add `window.addEventListener('tag-filter', (e) => { filterFn(e.detail) })` in the inline `<script>`

### I2. Guard Invalid Date Rendering

**Files:** `src/pages/articles.astro`, `src/pages/article/[slug].astro`

Wrap date rendering with a validity check:
```ts
{post.created && !isNaN(new Date(post.created).getTime())
  ? new Date(post.created).toLocaleDateString('zh-CN')
  : null}
```

### I3. Remove Cache Files from Git

**Files:** `.gitignore`, `CLAUDE.md`

- Add `src/config/cache/` to `.gitignore`
- Update `CLAUDE.md` dev commands section: note that `pnpm run generate-article-index && pnpm run generate-project-index` must be run before `pnpm dev` on a fresh checkout

### I4. Extract Shared `resolveSlug` Utility

**New file:** `src/utils/slug.ts`

```ts
export function resolveSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}
```

- `src/pages/project/[slug].astro`: replace inline slug logic with `import { resolveSlug } from '../../utils/slug'`
- `scripts/generate-project-index.js`: replace inline slug logic with `import { resolveSlug } from '../src/utils/slug.ts'` (or copy the function if ESM import from scripts is problematic — keep them in sync)

> Note: verify ESM import path works from the scripts directory; if not, the script can use a local copy and the spec should be updated.

### I5. Hydration Strategy: `client:visible` for Below-Fold Components

**Files:** `src/pages/index.astro`, `src/pages/projects.astro`

| Component | Page | Change |
|-----------|------|--------|
| `AppList` | `index.astro` | `client:load` → `client:visible` |
| `ProjectCard` (featured) | `index.astro` | `client:load` → `client:visible` |
| `ProjectCard` (listing) | `projects.astro` | `client:load` → `client:visible` |

`TagFilter` on both pages stays `client:load` (above-fold, controls visible content).

### I6. Fix Twitter Link

**File:** `src/config/index.ts`

```ts
twitter: 'https://x.com/tcyeee',
```

---

## Batch 3: Suggestions

### S1. Remove Unnecessary Deep-Clone

**File:** `src/config/index.ts`

```ts
// Before
export const projects: Project[] = JSON.parse(JSON.stringify(projects_json))
// After
export const projects: Project[] = projects_json as unknown as Project[]
```

Same for `articles`.

### S2. Fix Conflicting Width Styles in AppList

**File:** `src/components/AppList.tsx`

Replace `w-full` class + `style={{ width: '75%' }}` with single `w-3/4` Tailwind class.

### S3. Clean Up AppIcon Dead Code

**File:** `src/components/AppIcon.tsx`

- Remove `className={\`\`}` from `<img>` element
- Remove the empty `<div className={\`\`} />`

### S4. Fix Copy-Paste Error in index_app.json

**File:** `src/config/index_app.json`

Item `"2"` (Bookmarkify): change `"description": "PicTidy"` to `"description": "Bookmarkify"` (or the correct description for that app).

### S5. Add Open Graph Meta Tags

**File:** `src/layouts/Layout.astro`

Extend `Props` with optional `ogImage?: string`. Add to `<head>`:

```html
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage ?? '/og-default.png'} />
<meta name="twitter:card" content="summary_large_image" />
```

A default OG image (`/public/og-default.png`) should be added or noted as a TODO if the image doesn't exist yet.

### S6. Add `datetime` Attribute to `<time>` Elements

**Files:** `src/pages/articles.astro`, `src/pages/article/[slug].astro`

```html
<time datetime={post.created}>
  {new Date(post.created).toLocaleDateString('zh-CN')}
</time>
```

---

## File Change Summary

| File | Batch | Change type |
|------|-------|-------------|
| `src/utils/markdown.ts` | C1 | Add DOMPurify sanitization |
| `src/pages/project/[slug].astro` | C2, I4 | Slug validation + import resolveSlug |
| `src/pages/article/[slug].astro` | C2, I2, S6 | Slug validation, date guard, datetime attr |
| `src/utils/slug.ts` | I4 | New file |
| `src/components/TagFilter.tsx` | I1 | CustomEvent dispatch |
| `src/pages/articles.astro` | I1, I2, S6 | CustomEvent listener, date guard, datetime |
| `src/pages/projects.astro` | I1, I5 | CustomEvent listener, client:visible |
| `src/pages/index.astro` | I5 | client:visible |
| `src/config/index.ts` | I6, S1 | Twitter URL, remove deep-clone |
| `src/components/AppList.tsx` | S2 | Fix width classes |
| `src/components/AppIcon.tsx` | S3 | Remove dead code |
| `src/config/index_app.json` | S4 | Fix description |
| `src/layouts/Layout.astro` | S5 | OG meta tags |
| `.gitignore` | I3 | Add cache dir |
| `CLAUDE.md` | I3 | Document prebuild step |

**New dependency:** `isomorphic-dompurify` + `@types/dompurify`
