# 图片骨架屏加载动画 — 设计文档

日期: 2026-06-16

## 背景与问题

站点内容图片（项目卡片预览图、App 图标、文章/项目详情页 banner、文章列表 banner）加载时会"卡顿"——图片下载完成后突然出现，缺少过渡，体验生硬。需要在图片加载期间显示骨架屏微光（skeleton shimmer）动画，加载完成后图片平滑淡入。

## 目标

- 所有**内容图**在加载期间显示骨架屏微光占位，加载完成后淡入。
- 一套实现同时适用于 React 组件（SSR + `client:visible` 水合）与纯 Astro 静态页面渲染的图片。
- 不引入额外水合开销，不改变现有数据流。
- 加载失败时移除微光（不无限旋转），保留 `AppIcon` 现有的 `onError` 占位逻辑。
- 尊重 `prefers-reduced-motion`：禁用微光动画。

### 非目标 / 范围外

- 主页与关于页的**头像**（单张小图）不在范围内。
- 不做 blur-up 低清占位（不生成 LQIP）。
- 不改动图片本身的懒加载策略（保留现有 `loading="lazy"` `decoding="async"`）。

## 方案（全局 CSS 骨架屏 + 轻量委托脚本）

所有目标图片在 SSR 输出中都是普通 `<img>`，因此采用基于 DOM 的全局方案，框架无关，一处实现覆盖 React 与 Astro 两类图片。

### 1. 骨架屏样式

新增 `src/styles/image.scss`，并在 `Layout.astro` 中 `import`（与 `global.css` 并列）。

- `.img-skeleton`：作为图片容器，`position: relative; overflow: hidden;`。
- `.img-skeleton::before`：绝对定位铺满容器，浅灰渐变（`linear-gradient(90deg, base, highlight, base)`），通过 `@keyframes shimmer` 横向平移制造微光；提供暗色模式变体（容器或 `html.dark` 下使用更深的灰）。
- `.img-skeleton img`：初始 `opacity: 0`，`transition: opacity 400ms ease`。
- `.img-skeleton[data-loaded="true"]`：
  - `::before` 隐藏（`opacity: 0` 或 `display: none`，并停止动画）。
  - `img` `opacity: 1`。
- `@media (prefers-reduced-motion: reduce)`：取消 `::before` 的 shimmer 动画（保留静态灰底），图片仍淡入（或直接显示）。

> 注：`ProjectCard` 的 `aspect-video` 容器已有 `bg-gray-100 dark:bg-gray-700` + `overflow-hidden`，叠加 `.img-skeleton` 后微光铺在灰底之上即可。

### 2. 全局加载脚本

在 `Layout.astro` `<body>` 末尾新增一个 `<script>`（模块或 inline 均可），逻辑：

1. 定义 `markLoaded(wrapper)`：设置 `wrapper.dataset.loaded = 'true'`。
2. 定义 `bind(img)`：
   - 找到最近的 `.img-skeleton` 祖先 `wrapper`；无则跳过。
   - 若 `img.complete && img.naturalWidth > 0`（已缓存）→ 立即 `markLoaded`（避免缓存命中时闪一下微光）。
   - 否则监听 `load` 与 `error`，两者都触发 `markLoaded`（失败也移除微光；`AppIcon` 的 `onError` 会先把 `src` 换成占位图，随后该图 `load` 再次触发 `markLoaded`）。
3. 页面加载时（脚本位于 body 末尾，DOM 已就绪）对所有 `.img-skeleton img` 执行 `bind`。
4. 用一个 `MutationObserver` 观察 `document.body`，对新增/被替换的 `.img-skeleton img` 执行 `bind`，作为 React `client:visible` 水合时可能重建节点的安全网。

> 站点为纯 MPA，无 `astro:page-load` 视图过渡，无需绑定该事件。

### 3. 应用 `.img-skeleton` 容器

| 文件 | 改动 |
|------|------|
| `src/components/ProjectCard.tsx` | 现有 `aspect-video` 容器 `div` 追加 `img-skeleton` class |
| `src/components/AppIcon.tsx` | 用 `.img-skeleton` 容器包裹主图标 `img`（小程序角标 `img` 不包裹）|
| `src/pages/project/[slug].astro` | banner `img`（第 ~130 行）外层包 `.img-skeleton` 容器 |
| `src/pages/article/[slug].astro` | banner `img`（第 ~122 行）外层包 `.img-skeleton` 容器 |
| `src/pages/articles.astro` | 列表 banner `img`（第 ~59 行）外层 `.img-skeleton` 容器 |

包裹容器需保持原有圆角/尺寸/`object-cover` 表现：将原图的 `rounded-*`、尺寸类移到（或同时作用于）容器，确保微光被裁进圆角内。

## 错误处理

- 图片加载失败：`error` 事件同样 `markLoaded`，移除微光。`AppIcon` 的 `onError` 占位 SVG 逻辑不变。
- JS 被禁用：图片为静态 `<img>`，仍会正常显示（仅 `opacity:0` 初始态需兜底——见下）。
  - 兜底：用 `<noscript>` 或在脚本最前面给 `html` 加 `js` 类，仅在 `.js .img-skeleton img` 时才 `opacity: 0`，避免无 JS 时图片永久隐藏。

## 测试与验证

无自动化测试框架。手动验证（`pnpm dev`）：

1. 首屏项目卡片：硬刷新（禁用缓存 / 慢速 3G 节流）应看到微光占位 → 图片淡入。
2. 缓存命中再次访问：图片应直接显示，不闪微光。
3. App 图标、文章列表 banner、文章/项目详情页 banner 同样表现。
4. 暗色模式下微光为深灰变体。
5. 故意写错一个图片 `src` → 微光消失，显示占位/无限制旋转。
6. 开启系统"减少动态效果" → 无 shimmer 动画，图片仍正常显示。
7. 禁用 JS → 所有图片正常显示（不隐藏）。

## 影响文件汇总

- 新增：`src/styles/image.scss`
- 修改：`src/layouts/Layout.astro`（import 样式 + 全局脚本 + `js` 类）
- 修改：`src/components/ProjectCard.tsx`、`src/components/AppIcon.tsx`
- 修改：`src/pages/project/[slug].astro`、`src/pages/article/[slug].astro`、`src/pages/articles.astro`
