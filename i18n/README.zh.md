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

<div align="center">中文 ｜ <a href="../README.md">English</a></div><br><br>

基于 Astro + React 的响应式个人作品集，展示项目、文章与社交信息，附带项目分类、标签和演示链接。

![](/public/frame.png)

## 技术栈
- 框架：Astro（集成 React 组件）
- 样式：Tailwind CSS + SCSS
- 包管理：pnpm
- 语言/构建：TypeScript、ESM

## 快速开始
> 环境：Node.js 18+，pnpm 8+

```bash
pnpm install
pnpm dev       # 本地开发，默认 http://localhost:4321
pnpm build     # 生成生产静态文件
```

## 目录概览
```
portfolio/
├─ public/                 # 静态资源（图片、图标等）
├─ public/articles/        # Markdown 文章（用于生成文章索引）
├─ public/projects/        # Markdown 项目（用于生成项目索引）
├─ scripts/                # 辅助脚本
│  ├─ generate-article-index.js
│  └─ generate-project-index.js
├─ src/
│  ├─ components/          # React/Astro 组件
│  ├─ config/              # 数据与配置（含 cache/ 生成的索引）
│  ├─ layouts/             # 页面布局
│  ├─ pages/               # Astro 路由
│  └─ styles/              # 全局样式与图标
└─ astro.config.mjs        # Astro 配置
```

## 配置与数据
- 个人信息、项目/文章/APP 数据：`src/config/index.ts`
- 图标样式与内嵌 SVG：`src/styles/icon.scss`
- 文章存放：`public/articles/`，索引输出 `src/config/cache/articles.json`
- 项目存放：`public/projects/`，索引输出 `src/config/cache/projects.json`
- 项目分类标签映射：`src/config/index.ts` 的 `ProjectCategory`、`categoryLabels`、`categoryColors`

## 索引脚本
- 构建前自动执行（`prebuild`）：`generate-article-index`、`generate-project-index`
- 手动生成（任选其一）：
  ```bash
  pnpm run generate-article-index
  pnpm run generate-project-index
  ```
- 如需调整生成规则（目录、输出路径、摘要长度），编辑 `scripts/generate-article-index.js` / `scripts/generate-project-index.js` 或关联的配置文件，并同步修改 `src/config/index.ts` 的导入路径（Astro 静态导入限制）。

## 部署
构建产物位于 `dist/`，可直接部署到任意静态托管（Vercel、Netlify、GitHub Pages 等）。
