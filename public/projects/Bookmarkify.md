---
created: 2023-06-17 13:25
category: app
tags:
  - bookmark
  - WEB
banner: /images/banner/04.png
demoUrl: https://bookmarkify.cc
githubUrl: https://github.com/tcyeee/bookmarkify
description: Bookmarkify is a clean and intuitive web application that helps you collect and manage your online bookmarks. You can save any webpage with one click, organize your links into easy-to-browse collections, and share your favorite bookmark lists with others.
---

<div style="display:flex;justify-content: center;gap:0.5rem;width:auto">
	<img src="https://img.shields.io/badge/📩-tcyeee@outlook.com-red">
	<img src="https://img.shields.io/github/last-commit/tcyeee/bookmarkify">
	<img src="https://img.shields.io/github/license/tcyeee/bookmarkify">
	<img src="https://img.shields.io/github/stars/tcyeee/bookmarkify">
</div>


Bookmarkify is a modern web application for saving, organizing, sharing, and exploring web bookmarks. With an intuitive interface and powerful features, it makes bookmark management simple and efficient.

## ✨ Features

- **📚 Bookmark Management** - Quickly save and organize your web bookmarks with categories and tags
- **🔗 Smart Parsing** - Automatically extract webpage titles, descriptions, and icons for beautiful bookmarks
- **👥 Share & Collaborate** - Share bookmarks with friends or publish them publicly for others to discover
- **🔥 Trending Discovery** - Explore recently popular bookmarks from the community
- **🌐 Real-time Sync** - WebSocket-based real-time data synchronization for seamless multi-device experience
- **📱 Responsive Design** - Perfectly adapted for both desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Language**: Kotlin 2.1.20
- **Framework**: Spring Boot 3.5.0
- **Database**: PostgreSQL
- **Cache**: Redis
- **ORM**: MyBatis Plus
- **Authentication**: Sa-Token
- **Real-time**: WebSocket
- **API Documentation**: Knife4j (Swagger)
- **Web Scraping**: JSoup

### Frontend
- **Framework**: Nuxt.js 4.2.1
- **UI Library**: Vue 3 + Element Plus
- **State Management**: Pinia
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: Vue Draggable

## 📁 Project Structure

```
bookmarkify/
├── bookmarkify-api/     # Backend service (Kotlin + Spring Boot)
└── bookmarkify-web/      # Frontend application (Nuxt.js + Vue 3)
```

## 🚀 Quick Start

### Prerequisites
- JDK 21+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend Setup
```bash
cd bookmarkify-api
./gradlew bootRun
```

### Frontend Setup
```bash
cd bookmarkify-web
pnpm install
pnpm dev
```

## 📄 License

This project is licensed under the MIT License.

