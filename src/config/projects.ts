import type { App, LifePost, Project } from "../domain";


// 个人信息配置
export const personalInfo = {
  name: 'Lucas',
  title: '全栈开发工程师',
  bio: '8年全栈经验，热爱编程，专注于 Web 开发和区块链技术。喜欢构建有用的工具和应用，享受创造的过程。',
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
  {
    id: 'app-1',
    name: '我的应用',
    icon: '/images/app-icons/app-1.png',
    type: 'app',
    url: 'https://your-app.com',
    description: '应用描述',
  },
  {
    id: 'miniprogram-1',
    name: '我的小程序',
    icon: '/images/app-icons/miniprogram-1.png',
    type: 'miniprogram',
    url: 'https://your-miniprogram.com',
    description: '小程序描述',
  },
  {
    id: 'plugin-1',
    name: '我的插件',
    icon: '/images/app-icons/plugin-1.png',
    type: 'plugin',
    url: 'https://your-plugin.com',
    description: '插件描述',
  },
];

