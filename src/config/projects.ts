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
  linkedin: '',
  redNote: 'https://www.xiaohongshu.com/user/profile/5b9cf40e9a9c9300014062b4',
  bilibili: 'https://space.bilibili.com/10879225',
  skills: [
    'Java',
    'Spring Boot',
    'SQL',
    'RabbitMQ',
    'TypeScript',
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
    tablet: 7,    // 平板每行5个
    desktop: 8,   // 桌面端每行6个
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
    id: 'omega40_cases',
    title: 'Omega40 Cases',
    description: '为满足日常使用场景而设计制作的一款客制化键盘, 代码以及图纸我已经开源, 并且有商店在量产售卖(当然我是没有任何版权收益的).\r\n项目包含软件分为三个部分:\r\n1:固件源码\r\n2:设计图纸\r\n3:基于mac的相关脚本.',
    category: '3D-Printer',
    tags: ["客制化", "Shapr3D", "3D打印"],
    image: '/images/interest/1_2.jpg',
    githubUrl: 'https://github.com/tcyeee/omega40_cases',
    demoUrl: '',
    featured: true,
    year: 2024,
  },
  {
    id: 'PixWallet',
    title: 'PixWallet',
    description: 'PixWallet is a pixel-art-inspired Solana wallet built with Tauri, designed to provide a lightweight and secure experience. It supports both macOS and Windows, allowing users to manage their SOL assets seamlessly across desktop platforms.',
    category: 'blockchain',
    tags: ["Solana", "Tauri", "Web3", "Rust"],
    image: '/images/interest/2.png',
    githubUrl: 'https://github.com/tcyeee/PixWallet',
    demoUrl: '',
    featured: true,
    year: 2025,
  },
  {
    id: 'pictidy',
    title: 'PicTidy',
    description: 'PicTidy is a simple and efficient desktop tool designed to help you clean and organize your photos.',
    category: 'plugin',
    tags: ['Flutter', 'Dart', "Desktop-App"],
    image: '/images/interest/3.png',
    githubUrl: 'https://github.com/tcyeee/pictidy',
    demoUrl: 'https://obsidian.md/plugins/example',
    featured: true,
    year: 2024,
  },
  {
    id: 'bases-lock',
    title: 'Bases Lock',
    description: 'PicTidy is a simple and efficient desktop tool designed to help you clean and organize your photos.',
    category: 'plugin',
    tags: ['Obsidian', 'TypeScript', 'Plugin'],
    image: '/images/interest/4.png',
    githubUrl: 'https://github.com/tcyeee/obsidian-bases-lock',
    demoUrl: '',
    featured: true,
    year: 2025,
  },
  {
    id: 'nft-dapp',
    title: 'NFT DApp',
    description: 'Nft交易小站是一个基于Sepolia测试网络的NFT交易平台, 目前托管于Vercel, 交易货币可以在任意Faucet获取.\r\nps:项目大概永远不会并入ETH主网',
    category: 'blockchain',
    tags: ['Solidity', 'Web3', 'Ethereum'],
    image: '/images/interest/5.png',
    githubUrl: '',
    demoUrl: 'https://challenge-0-atl5oq0p1-lucas-projects-360e6e92.vercel.app',
    featured: false,
    year: 2023,
  },
  {
    id: 'bookmarkify',
    title: 'Bookmarkify',
    description: 'Bookmarkify is a clean and intuitive web application that helps you collect and manage your online bookmarks. You can save any webpage with one click, organize your links into easy-to-browse collections, and share your favorite bookmark lists with others.',
    category: 'app',
    tags: ["bookmark", "WEB"],
    image: '/images/interest/4_2.png',
    githubUrl: 'https://github.com/tcyeee/bookmarkify',
    demoUrl: 'https://bookmarkify.cc',
    featured: false,
    year: 2022,
  }
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
    id: '019ad92e-4c80-7063-abd6-77ae4334327a',
    name: 'PicTidy',
    icon: '/images/icons/pictidy.png',
    type: 'app',
    url: 'https://github.com/tcyeee/pictidy',
    description: 'PicTidy',
  },
  {
    id: '019ad9e9-7350-72cf-a985-16467f033c66',
    name: 'Bookmarkify',
    icon: '/images/icons/bookmarkify.png',
    type: 'app',
    url: 'https://github.com/tcyeee/bookmarkify',
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
    name: 'Podcast Shortcuts',
    icon: '/images/icons/podcast-shortcuts.png',
    type: 'plugin',
    url: 'https://github.com/tcyeee/podcast-shortcuts',
    description: 'Podcast Shortcuts',
  },
  {
    id: '019ad9d4-ec83-70f3-8fc2-193c6a4f6dfd',
    name: 'BB AFK',
    icon: '/images/icons/bb-afk.png',
    type: 'plugin',
    url: 'https://github.com/tcyeee/bb-afk',
    description: 'BB AFK',
  },
];


