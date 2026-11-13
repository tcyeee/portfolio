---
created: 2026-03-20
category: plugin
tags:
  - Obsidian
  - TypeScript
  - Plugin
githubUrl: https://github.com/tcyeee/obsidian-link-trace
downloadUrl: https://github.com/tcyeee/obsidian-link-trace/releases
demoUrl: 
description: Turn any Obsidian note into a shareable web page — publish it as a short link with view tracking, or export it as a standalone HTML file.
---


<div style="display:flex;justify-content: center;gap:0.5rem;width:auto">
	<img src="https://img.shields.io/badge/📩-tcyeee@outlook.com-red">
	<img src="https://img.shields.io/github/last-commit/tcyeee/obsidian-link-trace">
	<img src="https://img.shields.io/github/v/release/tcyeee/obsidian-link-trace">
	<img src="https://img.shields.io/github/license/tcyeee/obsidian-link-trace">
	<img src="https://img.shields.io/github/stars/tcyeee/obsidian-link-trace">
</div>

Turn any Obsidian note into a shareable web page — publish it as a short link and see who's reading it, or export it as a standalone HTML file you can send to anyone.

### What it does

Open a note, click the share icon in the status bar, and get either:

- A **short share link** (e.g. `https://your-domain.com/notes/ab3`) that anyone can open in a browser — no Obsidian required — with page-view tracking.
- A **self-contained ZIP file** with the note rendered as HTML, ready to send by email or host anywhere.

Directly linked notes (and their links, one level deeper) can be bundled in too, so readers can click through a small wiki, not just one page.

## ✨ Features

- **One-click publish** to your own Aliyun OSS or Tencent COS bucket, with the link copied to your clipboard automatically
- **Local ZIP export** — a self-contained package (HTML + CSS + images) that opens in any browser, no server needed
- **Linked notes** — optionally bundle directly-linked notes (and one level further) with working navigation between them
- **Faithful rendering** of note content:
  - Math via KaTeX (`$ ... $` and `$$ ... $$`)
  - Code blocks with syntax highlighting and a one-click copy button
  - Callouts with fold/unfold
  - Responsive tables
  - Image galleries with lightbox (including the Image Cluster `imgs` block format)
  - Dataview queries rendered as static tables/lists
  - Obsidian Bases rendered as tables or cards
- **Auto-generated table of contents** sidebar with scroll tracking, collapsible on mobile
- **Status bar indicator** — the share icon turns green when the current note is published, and flags it as stale after edits
- **Share Stats page** — lists every published page, with totals and a per-page detail view (visits over time, referrers, browsers, OS, countries, screen sizes)
- **Privacy-friendly analytics** — cookieless view tracking via a self-hosted GoatCounter instance, no personal data collected
- **English / 中文** interface

## ⬇️ Installation

1. In Obsidian, open **Settings → Community plugins → Browse**.
2. Search for **Link Trace** and click **Install**, then **Enable**.

## ⭐ Usage

### Export a ZIP (no cloud account needed)

Click the share icon in the status bar and choose **Export as ZIP** (also available from the command palette). The ZIP contains:

```
note-name/
├── index.html
├── style.css
└── images/
```

Unzip it and open `index.html` in any browser — everything (styles, images, math, etc.) is bundled, nothing needs a server.

### Publish online

1. In plugin settings, pick a **Publish route** (Aliyun OSS or Tencent COS) and fill in your bucket credentials.
2. Click the share icon in the status bar and choose **Publish Note**.
3. The shareable link is copied to your clipboard automatically.

### The share popover

| Action | What it does |
| --- | --- |
| Copy link | Copies the published URL |
| Open link | Opens the published page in your browser |
| Re-publish | Re-uploads after edits (the link stays the same) — shown when the note has changed since it was last published |
| Export as ZIP | Saves a local copy |
| Stop sharing | Deletes the page from the cloud; the link stops working |

### Share Stats page

Click the bar-chart icon in the left ribbon (or run **"Open share stats page"**) to see every note ever published, its cumulative view count, and a link to open the note or its published page — even pages with zero views are listed.

## ⚙️ Settings

Open **Settings → Link Trace**:

**General**
- **Language** — interface language, 中文 or English

**Export settings**
- **Export depth** — how much to include: this note only, + direct linked notes, or + one more level of links
- **Page name length** — length of the random path segment in share links (2–6 characters); longer means a lower chance of collisions
- **Unique-note prefix compatibility** — strips the core "Unique note creator" plugin's timestamp prefix from the exported page title

**Publish route** — choose one cloud storage backend and fill in its credentials:

| Aliyun OSS | Tencent COS |
| --- | --- |
| Region, Bucket, Access Key ID/Secret, upload prefix, custom domain | Region, Bucket (with APPID), SecretId/SecretKey, upload prefix, custom domain |

Both require the bucket to allow public read access, and a custom domain configured so links open directly in the browser instead of triggering a download.

## Privacy & analytics

Published pages embed a lightweight, cookieless view-count tracker via a self-hosted GoatCounter instance — it collects no personal data and sets no cookies.

## Requirements

- Obsidian 1.7.2 or later
- Desktop only (mobile is not supported)
