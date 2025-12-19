# 个人作品集网站

基于 Astro 构建的现代化个人作品集网站，展示项目作品、个人简介和技术栈。

## 技术栈

- **框架**: [Astro](https://astro.build/) - 静态站点生成器
- **UI 框架**: React
- **样式**: Tailwind CSS + SCSS
- **包管理**: pnpm

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 [http://localhost:4321](http://localhost:4321) 查看网站。

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 项目结构

```
portfolio/
├── public/          # 静态资源（图片、图标等）
├── scripts/         # 构建脚本
│   └── generate-article-index.js   # 文章索引生成脚本
└── articles/ # 文章目录
    └── *.md         # Markdown 文章文件
├── src/
│   ├── components/  # React/Astro 组件
│   ├── config/      # 配置文件（项目数据、分类等）
│   │     └─ cache/  # 文章&项目 索引缓存
│   ├── layouts/     # 布局组件
│   ├── pages/       # 页面路由
│   └── styles/      # 全局样式
└── astro.config.mjs # Astro 配置文件
```

## 页面

- `/` - 首页（展示精选项目和 APP 列表）
- `/projects` - 所有项目
- `/articles` - 文章列表
- `/about` - 关于我

## 配置

项目配置和数据位于 `src/config/` 目录下，可以在此修改个人信息、项目列表等内容。

### 文章管理

文章以 Markdown 格式存储在 `articles/` 目录下。每篇文章需要包含 YAML frontmatter：

```markdown
---
created: 2025-06-17 13:25
tags:
  - article
  - English
title: 文章标题（可选，默认使用文件名）
banner: 横幅图片路径（可选）
---

文章内容...
```

#### 文章索引生成

项目构建时会自动生成文章索引文件 `/src/config/cache/articles.json`，索引包含以下信息：
- `title` - 文章标题
- `content` - 文章第一段内容摘要（默认最多 100 字符）
- `created` - 创建时间
- `tags` - 标签数组
- `banner` - 横幅图片路径

**手动生成索引：**
```bash
pnpm run generate-article-index
```

**配置文章索引：**

编辑 `src/config/generate-config.js` 可以修改：
- `articleDir` - 文章所在目录（相对于 public 目录）
- `indexFile` - 索引文件路径（相对于 public 目录）
- `contentMaxLength` - 内容摘要字数限制（默认 100 字符）

⚠️ 注意：如果修改了 `indexFile`，还需要同步修改 `src/config/index.ts` 中的导入路径（第7行），因为 Astro 的静态导入限制。

注意：每次运行 `pnpm build` 时会自动重新生成索引，确保索引数据始终是最新的。

