import type { App, LifePost, Project } from "../domain";


// 个人信息配置
export const personalInfo = {
  name: 'Lucas',
  title: '全栈开发工程师',
  bio: '8年全栈经验，热爱编程，专注于 Web 开发和区块链技术。喜欢构建有用的工具和应用，享受创造的过程。绝大多数作品都会开源，或许有你需要的。',
  avatar: '/images/avatar.jpg',
  location: '中国',
  email: 'tcyeee@outlook.com',
  github: 'https://github.com/tcyeee',
  twitter: 'https://x.com/home',
  linkedin: 'https://www.linkedin.com/in/yue-chen-8bb7a223b',
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue',
    'Node.js',
    'Solidity',
    'Web3',
    'Astro',
    'Tailwind CSS',
  ],
}

// APP列表区域配置
export const appCloudConfig = {
  // APP图标大小（单位：px）
  iconSize: {
    mobile: 60,   // 移动端图标大小
    tablet: 70,   // 平板图标大小
    desktop: 80,  // 桌面端图标大小
  },
  // 每行APP数量
  itemsPerRow: {
    mobile: 4,    // 移动端每行4个
    tablet: 5,    // 平板每行5个
    desktop: 6,   // 桌面端每行6个
  },
  // APP间距（单位：px）
  gap: {
    mobile: 16,   // 移动端间距
    tablet: 20,   // 平板间距
    desktop: 24,  // 桌面端间距
  },
};


/* 作品集 */
export const projects: Project[] = [
  {
    id: 'project-1',
    title: '示例网页插件',
    description: '这是一个功能强大的浏览器扩展插件，可以提升你的浏览体验。支持多种自定义设置和快捷操作。',
    category: 'web-extension',
    tags: ['Chrome Extension', 'JavaScript', 'React'],
    image: '/images/project-placeholder.jpg',
    githubUrl: 'https://github.com/yourusername/project-1',
    demoUrl: 'https://chrome.google.com/webstore/example',
    featured: true,
    year: 2024,
  },
  {
    id: 'project-2',
    title: 'Obsidian 笔记增强插件',
    description: '为 Obsidian 笔记应用开发的插件，提供更多笔记管理和组织功能，让知识管理更高效。',
    category: 'obsidian-plugin',
    tags: ['Obsidian', 'TypeScript', 'Plugin'],
    image: '/images/project-placeholder.jpg',
    githubUrl: 'https://github.com/yourusername/project-2',
    demoUrl: 'https://obsidian.md/plugins/example',
    featured: true,
    year: 2024,
  },
  {
    id: 'project-3',
    title: '现代化 Web 应用',
    description: '使用最新技术栈构建的响应式 Web 应用，提供流畅的用户体验和现代化的界面设计。',
    category: 'web-app',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    image: '/images/project-placeholder.jpg',
    githubUrl: 'https://github.com/yourusername/project-3',
    demoUrl: 'https://your-app-demo.com',
    featured: true,
    year: 2024,
  },
  {
    id: 'project-4',
    title: '区块链 DApp',
    description: '基于以太坊的去中心化应用，实现了智能合约交互和 Web3 功能，支持钱包连接和交易。',
    category: 'blockchain',
    tags: ['Solidity', 'Web3', 'Ethereum', 'React'],
    image: '/images/project-placeholder.jpg',
    githubUrl: 'https://github.com/yourusername/project-4',
    demoUrl: 'https://your-dapp.com',
    featured: false,
    year: 2023,
  },
  {
    id: 'project-5',
    title: '另一个 Web 应用',
    description: '功能丰富的 Web 应用，展示了现代前端开发的最佳实践。',
    category: 'web-app',
    tags: ['Vue', 'Node.js', 'MongoDB'],
    image: '/images/project-placeholder.jpg',
    githubUrl: 'https://github.com/yourusername/project-5',
    featured: false,
    year: 2023,
  },
];

// 个人生活内容配置
export const lifePosts: LifePost[] = [
  {
    id: 'life-1',
    title: '我的编程之旅',
    content: '分享一些关于编程学习的经验和心得，以及在这个过程中的成长和收获。',
    date: '2024-01-15',
    tags: ['编程', '学习', '成长'],
    images: ['/images/life-placeholder.jpg'],
  },
  {
    id: 'life-2',
    title: '开源贡献经历',
    content: '参与开源项目的经历和收获，以及如何为开源社区做出贡献。',
    date: '2024-02-20',
    tags: ['开源', '社区', '贡献'],
  },
  {
    id: 'life-3',
    title: '技术栈探索',
    content: '探索和学习新技术栈的过程，包括遇到的问题和解决方案。',
    date: '2024-03-10',
    tags: ['技术', '学习', '探索'],
  },
];

// APP列表配置 - 在这里添加你的APP
export const apps: App[] = [
  // 应用类型
  {
    id: '019ad92e-4c80-7063-abd6-77ae4334327a',
    name: 'PicTidy',
    icon: '/images/icons/pictidy.png',
    type: 'app',
    url: 'https://github.com/tcyeee/pictidy',
    description: 'PicTidy',
  },
  {
    id: '019ad932-b758-761c-a29e-f78b60c016d1',
    name: 'PixWallet',
    icon: '/images/icons/pixwallet.png',
    type: 'app',
    url: 'https://github.com/tcyeee/PixWallet',
    description: 'PixWallet',
  },
  // 小程序类型
  {
    id: '019ad932-e06b-77ed-808c-e886a8ceecd1',
    name: '瑞文测试',
    icon: '/images/icons/raven-test.png',
    type: 'miniprogram',
    url: 'https://github.com/tcyeee/raven-test',
    description: 'raven-test',
  },

  // 插件类型
  {
    id: '019ad933-11ad-7614-8025-f3f5716312e3',
    name: 'Image Cluster',
    icon: '/images/icons/image-cluster.png',
    type: 'plugin',
    url: 'https://github.com/tcyeee/obsidian-image-cluster',
    description: 'obsidian-image-cluster',
  },
  {
    id: '019ad933-388f-7542-8b3d-5e9593c82fee',
    name: 'Bases Lock',
    icon: '/images/icons/bases-lock.png',
    type: 'plugin',
    url: 'https://github.com/tcyeee/obsidian-bases-lock',
    description: 'obsidian-bases-lock',
  },
  {
    id: '019ad933-457d-7786-99d5-b3d4486b3a32',
    name: '我的插件3',
    icon: '/images/app-icons/plugin-3.png',
    type: 'plugin',
    url: 'https://your-plugin-3.com',
    description: '插件3描述',
  },
];


