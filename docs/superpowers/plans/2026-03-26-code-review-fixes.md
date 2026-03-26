# Code Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 14 issues identified in the full-project code review, grouped into 3 priority batches: Critical, Important, Suggestions.

**Architecture:** No test framework exists in this project — verification is done via `pnpm build` (fails on type errors and broken imports) plus visual inspection of `pnpm dev`. Each task ends with a build verification and commit. The content pipeline uses prebuild scripts that generate JSON cache files; these will be removed from git tracking in Task 6.

**Tech Stack:** Astro 5, React 18, TypeScript, Tailwind CSS, pnpm

---

## Batch 1: Critical

### Task 1: Add HTML Sanitization to Markdown Renderer

**Files:**
- Modify: `src/utils/markdown.ts`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add isomorphic-dompurify
pnpm add -D @types/dompurify
```

- [ ] **Step 2: Add sanitization to `renderMarkdown`**

In `src/utils/markdown.ts`, add the import at the top and wrap the return value:

```ts
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import katex from "katex";
import DOMPurify from "isomorphic-dompurify";
```

Then change the last line of `renderMarkdown` from:
```ts
  return await marked(processedContent);
```
to:
```ts
  const html = await marked(processedContent);
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['math', 'semantics', 'mrow', 'mn', 'mo', 'mi', 'msup', 'msub', 'mfrac', 'msubsup', 'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd', 'annotation', 'annotation-xml'],
    ADD_ATTR: ['class', 'style', 'xmlns', 'encoding'],
  });
```

> The `ADD_TAGS` / `ADD_ATTR` list preserves KaTeX's MathML output which DOMPurify would otherwise strip.

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/markdown.ts package.json pnpm-lock.yaml
git commit -m "feat: add DOMPurify sanitization to markdown renderer"
```

---

### Task 2: Add Slug Validation to Detail Pages

**Files:**
- Modify: `src/pages/project/[slug].astro:71-79`
- Modify: `src/pages/article/[slug].astro:51-61`

- [ ] **Step 1: Add slug validation to `project/[slug].astro`**

After line 32 (`const slugFromParams = Astro.params.slug`), insert:

```ts
// Validate slug to prevent path traversal
if (slugFromParams && !/^[a-z0-9-_.]+$/i.test(slugFromParams)) {
  return Astro.redirect('/projects')
}
```

- [ ] **Step 2: Add slug validation to `article/[slug].astro`**

After line 51 (`const slugFromParams = Astro.params.slug`), insert:

```ts
// Validate slug to prevent path traversal
if (slugFromParams && !/^[a-z0-9-_.]+$/i.test(slugFromParams)) {
  return Astro.redirect('/articles')
}
```

> Note: The article page slug comes from filenames (which can include non-ASCII characters in the original files), so `[a-z0-9-_.]` with case-insensitive flag is sufficient to block `../` traversal attempts while allowing normal slugs.

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/project/[slug].astro src/pages/article/[slug].astro
git commit -m "fix: add slug validation to prevent path traversal"
```

---

## Batch 2: Important

### Task 3: Extract Shared `resolveSlug` Utility

**Files:**
- Create: `src/utils/slug.js`
- Modify: `scripts/generate-project-index.js`
- Modify: `src/pages/project/[slug].astro`

> Note: Using `.js` (not `.ts`) because `scripts/` runs with plain `node` and cannot import TypeScript files.

- [ ] **Step 1: Create `src/utils/slug.js`**

```js
/**
 * Generate a URL-safe slug from frontmatter fields or a filename.
 * Priority: frontmatter.slug > frontmatter.title > filename (without .md)
 *
 * @param {Record<string, any>} frontmatter
 * @param {string} filename
 * @returns {string}
 */
export function resolveSlug(frontmatter, filename) {
  const base = filename.replace(/\.md$/, '')
  const source = frontmatter.slug || frontmatter.title || base
  return (
    String(source)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '') || base.toLowerCase().replace(/\s+/g, '-')
  )
}
```

- [ ] **Step 2: Update `scripts/generate-project-index.js`**

Replace the existing `resolveSlug` function (lines 32–44) and the helper `getTitleFromFilename` with an import:

```js
import { resolveSlug } from '../src/utils/slug.js';
```

Remove the local `resolveSlug` function definition entirely. Keep `getTitleFromFilename` if it's still used elsewhere in the file (it's used in lines 92–93 for `title`), otherwise replace those callsites with `filename.replace(/\.md$/, '')` inline.

After the change the top of the file should look like:

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { projectConfig } from '../src/config/generate-config.js';
import { resolveSlug } from '../src/utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

And replace all uses of `getTitleFromFilename(file)` with `file.replace(/\.md$/, '')`.

- [ ] **Step 3: Update `src/pages/project/[slug].astro`**

Replace the local `resolveSlug` function (lines 35–44) with an import:

```ts
import { resolveSlug } from '../../utils/slug.js'
```

Remove the local function definition. The existing callsite `resolveSlug(parsed.data || {}, file)` at line 62 stays the same.

- [ ] **Step 4: Regenerate indexes and verify build**

```bash
pnpm generate-project-index
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add src/utils/slug.js scripts/generate-project-index.js src/pages/project/[slug].astro src/config/cache/projects.json
git commit -m "refactor: extract resolveSlug to shared utility"
```

---

### Task 4: Replace `window` Global with CustomEvent

**Files:**
- Modify: `src/components/TagFilter.tsx`
- Modify: `src/pages/articles.astro`

- [ ] **Step 1: Update `TagFilter.tsx`**

Replace the entire `useEffect` block (lines 11–22) with:

```ts
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('tag-filter', { detail: selectedTags }))
    if (onFilterChange) {
      onFilterChange(selectedTags)
    }
  }, [selectedTags, onFilterChange])
```

- [ ] **Step 2: Update the `<script>` block in `articles.astro`**

Replace the entire `<script>` block (lines 86–151) with:

```html
<script>
  function filterArticles(selectedTags: string[]) {
    const articleItems = document.querySelectorAll(
      '.article-item'
    ) as NodeListOf<HTMLElement>
    const emptyMessage = document.getElementById('empty-filter-message')
    const articlesContainer = document.getElementById('articles-container')

    if (selectedTags.length === 0) {
      articleItems.forEach((item) => { item.style.display = '' })
      if (emptyMessage) emptyMessage.classList.add('hidden')
      if (articlesContainer) articlesContainer.classList.remove('hidden')
      return
    }

    let visibleCount = 0
    articleItems.forEach((item) => {
      const tagsStr = item.getAttribute('data-tags')
      if (!tagsStr) { item.style.display = 'none'; return }
      try {
        const articleTags = JSON.parse(tagsStr) as string[]
        const shouldShow = selectedTags.some((tag) => articleTags.includes(tag))
        if (shouldShow) { item.style.display = ''; visibleCount++ }
        else { item.style.display = 'none' }
      } catch { item.style.display = 'none' }
    })

    if (visibleCount === 0) {
      if (emptyMessage) emptyMessage.classList.remove('hidden')
      if (articlesContainer) articlesContainer.classList.add('hidden')
    } else {
      if (emptyMessage) emptyMessage.classList.add('hidden')
      if (articlesContainer) articlesContainer.classList.remove('hidden')
    }
  }

  window.addEventListener('tag-filter', (e) => {
    filterArticles((e as CustomEvent<string[]>).detail)
  })
</script>
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/TagFilter.tsx src/pages/articles.astro
git commit -m "refactor: replace window global with CustomEvent for tag filtering"
```

---

### Task 5: Guard Invalid Date Rendering

**Files:**
- Modify: `src/pages/articles.astro:36-38`
- Modify: `src/pages/article/[slug].astro:91-99`

- [ ] **Step 1: Fix date in `articles.astro`**

Replace lines 36–38:
```astro
                  <time>
                    {new Date(post.created).toLocaleDateString("zh-CN")}
                  </time>
```
with:
```astro
                  {post.created && !isNaN(new Date(post.created).getTime()) && (
                    <time datetime={post.created}>
                      {new Date(post.created).toLocaleDateString("zh-CN")}
                    </time>
                  )}
```

> This also adds the `datetime` attribute, covering both I2 and S6 for this file.

- [ ] **Step 2: Fix date in `article/[slug].astro`**

Replace lines 91–99:
```astro
          created && (
            <time>
              {new Date(created).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )
```
with:
```astro
          created && !isNaN(new Date(created).getTime()) && (
            <time datetime={created}>
              {new Date(created).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )
```

> This also adds the `datetime` attribute, covering both I2 and S6 for this file.

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/articles.astro src/pages/article/[slug].astro
git commit -m "fix: guard invalid date rendering and add datetime attributes to time elements"
```

---

### Task 6: Remove Cache Files from Git

**Files:**
- Modify: `.gitignore`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add cache directory to `.gitignore`**

Append to `.gitignore`:
```
# generated content indexes (rebuilt by pnpm run generate-article-index / generate-project-index)
src/config/cache/
```

- [ ] **Step 2: Untrack the cache files**

```bash
git rm --cached src/config/cache/articles.json src/config/cache/projects.json
```

- [ ] **Step 3: Update `CLAUDE.md`**

In the Commands section, add a note after the existing commands:

```markdown
> On a fresh checkout, run `pnpm generate-article-index && pnpm generate-project-index` before `pnpm dev` to regenerate the content index cache.
```

- [ ] **Step 4: Verify indexes still regenerate correctly**

```bash
pnpm generate-article-index && pnpm generate-project-index && pnpm build
```

Expected: Cache files are recreated and build passes.

- [ ] **Step 5: Commit**

```bash
git add .gitignore CLAUDE.md
git commit -m "chore: remove generated cache files from git tracking"
```

---

### Task 7: Switch Below-Fold Components to `client:visible`

**Files:**
- Modify: `src/pages/index.astro:59,65`
- Modify: `src/pages/projects.astro:40`

- [ ] **Step 1: Update `index.astro`**

Line 59: change `<AppList client:load apps={apps} />` to:
```astro
<AppList client:visible apps={apps} />
```

Line 65: change `{featuredProjects.map((project) => <ProjectCard client:load project={project} />)}` to:
```astro
{featuredProjects.map((project) => <ProjectCard client:visible project={project} />)}
```

- [ ] **Step 2: Update `projects.astro`**

Line 40: change `<ProjectCard client:load project={project} />` to:
```astro
<ProjectCard client:visible project={project} />
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/projects.astro
git commit -m "perf: use client:visible for below-fold React islands"
```

---

### Task 8: Fix Twitter URL and Remove Deep-Clone

**Files:**
- Modify: `src/config/index.ts:14,23-25`

- [ ] **Step 1: Fix Twitter URL and remove deep-clone**

Replace lines 14, 23–25 in `src/config/index.ts`:

Line 14 — change:
```ts
  twitter: 'https://x.com/home',
```
to:
```ts
  twitter: 'https://x.com/tcyeee',
```

Lines 23–25 — change:
```ts
export const projects: Project[] = JSON.parse(JSON.stringify(projects_json));
export const articles: Article[] = JSON.parse(JSON.stringify(article_json));
export const apps: IndexApp[] = JSON.parse(JSON.stringify(index_app_json));
```
to:
```ts
export const projects: Project[] = projects_json as unknown as Project[]
export const articles: Article[] = article_json as unknown as Article[]
export const apps: IndexApp[] = index_app_json as unknown as IndexApp[]
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/config/index.ts
git commit -m "fix: correct Twitter URL and remove unnecessary deep-clone of JSON imports"
```

---

## Batch 3: Suggestions

### Task 9: Clean Up AppList and AppIcon

**Files:**
- Modify: `src/components/AppList.tsx:16`
- Modify: `src/components/AppIcon.tsx:20,27`

- [ ] **Step 1: Fix conflicting width in `AppList.tsx`**

Replace line 16:
```tsx
      <div className="w-full mx-auto" style={{ width: '75%' }}>
```
with:
```tsx
      <div className="w-3/4 mx-auto">
```

- [ ] **Step 2: Remove dead code in `AppIcon.tsx`**

Remove `className={\`\`}` from the `<img>` element — change:
```tsx
        src={app.icon}
        alt={app.name}
        className={``}
        onError=
```
to:
```tsx
        src={app.icon}
        alt={app.name}
        onError=
```

Remove the entire empty `<div>` — change:
```tsx
      />
      <div className={``} />
      {isMiniProgram && (
```
to:
```tsx
      />
      {isMiniProgram && (
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppList.tsx src/components/AppIcon.tsx
git commit -m "fix: remove dead code in AppIcon and conflicting width in AppList"
```

---

### Task 10: Fix Copy-Paste Error in `index_app.json`

**Files:**
- Modify: `src/config/index_app.json:16`

- [ ] **Step 1: Fix the description**

Change item with `"id": "2"` (Bookmarkify) from:
```json
    "description": "PicTidy"
```
to:
```json
    "description": "Bookmarkify"
```

- [ ] **Step 2: Commit**

```bash
git add src/config/index_app.json
git commit -m "fix: correct copy-paste description error in index_app.json"
```

---

### Task 11: Add Open Graph Meta Tags to Layout

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Update `Layout.astro` Props and `<head>`**

Replace the frontmatter and head section:

```astro
---
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'
import '../styles/global.css'

interface Props {
  title: string
  description?: string
  ogImage?: string
}

const { title, description = '个人作品展示网站', ogImage = '/images/avatar.jpg' } = Astro.props
const canonicalURL = new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin)
---
```

Then inside `<head>`, after `<title>{title}</title>`, add:

```html
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, canonicalURL)} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, canonicalURL)} />
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm build
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Open Graph and Twitter Card meta tags to Layout"
```

---

## Summary of All Files Changed

| Task | Files |
|------|-------|
| T1 | `src/utils/markdown.ts`, `package.json`, `pnpm-lock.yaml` |
| T2 | `src/pages/project/[slug].astro`, `src/pages/article/[slug].astro` |
| T3 | `src/utils/slug.js` (new), `scripts/generate-project-index.js`, `src/pages/project/[slug].astro` |
| T4 | `src/components/TagFilter.tsx`, `src/pages/articles.astro` |
| T5 | `src/pages/articles.astro`, `src/pages/article/[slug].astro` |
| T6 | `.gitignore`, `CLAUDE.md` |
| T7 | `src/pages/index.astro`, `src/pages/projects.astro` |
| T8 | `src/config/index.ts` |
| T9 | `src/components/AppList.tsx`, `src/components/AppIcon.tsx` |
| T10 | `src/config/index_app.json` |
| T11 | `src/layouts/Layout.astro` |
