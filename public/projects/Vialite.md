---
created: 2025-12-22
category: app
tags:
  - Keyboard
  - WebHID
  - TypeScript
banner: /projects/assets/vialite-2.png
demoUrl: https://vialite.viii.me/
githubUrl: https://github.com/tcyeee/vialite
description: Vialite is a native web configurator for Vial-protocol keyboards, running entirely in Chrome or Edge over WebHID with no Qt, WebAssembly, or install step required.
---

<div style="display:flex;justify-content: center;gap:0.5rem;width:auto">
	<img src="https://img.shields.io/badge/📩-tcyeee@outlook.com-red">
	<img src="https://img.shields.io/github/last-commit/tcyeee/vialite">
	<img src="https://img.shields.io/github/license/tcyeee/vialite">
	<img src="https://img.shields.io/github/stars/tcyeee/vialite">
</div>

<p align="center">
  <img src="/projects/assets/vialite-icon.svg" width="96" alt="Vialite icon">
</p>

Vialite is a from-scratch web frontend for Vial-protocol keyboards, talking to the device directly over WebHID instead of wrapping the official vial-gui or vial-web. The Vial HID protocol is reimplemented in TypeScript, ported from vial-gui's Python implementation.

![Vialite waiting for a keyboard to connect](./assets/vialite-1.png)

![The Vialite keymap editor](./assets/vialite-2.png)

## ✨ Features

- **Keymap editor** — physical-layout renderer with layer-tap and mod-tap editing
- **Keyboard personalization** — customize the on-screen keyboard, with PNG export
- **Macros, Tap Dance & Combos** — edit device-supported dynamic key behaviors
- **RGB Lighting (Beta)** — VialRGB controls, with changes saved to EEPROM on save
- **Import/export** of `.vil` files
- **Keyboard matrix test**, QMK settings, and a 3D preview (Beta)
- **Multi-language UI** — English, Simplified Chinese, Japanese, and French

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: React + Vite
- **Testing**: Vitest
- **Protocol**: Vial HID protocol, reimplemented from vial-gui

## 📋 Requirements

- Chrome or Edge (WebHID is not supported in Safari or Firefox)
- Node.js + pnpm (for local development)

## 📄 License

This project is licensed under the GPL-2.0 License.
