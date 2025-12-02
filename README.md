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
├── src/
│   ├── components/  # React/Astro 组件
│   ├── config/      # 配置文件（项目数据、分类等）
│   ├── layouts/     # 布局组件
│   ├── pages/       # 页面路由
│   └── styles/      # 全局样式
└── astro.config.mjs # Astro 配置文件
```

## 页面

- `/` - 首页（展示精选项目和 APP 列表）
- `/projects` - 所有项目
- `/about` - 关于我
- `/life` - 生活兴趣

## 配置

项目配置和数据位于 `src/config/` 目录下，可以在此修改个人信息、项目列表等内容。

