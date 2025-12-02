import type { IndexApp, Article as Article, Project } from "../domain";
import index_app_json from './index_app.json';
import projects_json from './projects.json';
import article_json from './article/cache/index.json';

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
  skills: ['Java', 'Spring Boot', 'SQL', 'RabbitMQ', 'TypeScript', 'Vue', 'Node.js', 'Solidity', 'Web3', 'Astro', 'Tailwind CSS'],
}

/* 作品集 ｜ 文章 ｜ 首页APP列表 */
export const projects: Project[] = JSON.parse(JSON.stringify(projects_json));
export const articles: Article[] = JSON.parse(JSON.stringify(article_json));
export const apps: IndexApp[] = JSON.parse(JSON.stringify(index_app_json));

// ==============[ 首页APP展示配置 ]=================

/* 首页APP分类： 首页APP列表中，每个APP仅属于一个分类 */
export enum IndexAppType {
  APP = 'app',
  MINI_PROGRAM = 'miniprogram',
  PLUGIN = 'plugin',
}

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

// ==============[ 项目分类标签配置 Start ]=================

/* 项目分类： 项目卡片中，项目名称右侧的标签，每个项目仅属于一个分类 */
export enum ProjectCategory {
  PLUGIN = 'plugin',
  APP = 'app',
  BLOCKCHAIN = 'blockchain',
  OTHER = 'other',
}

// 分类标签中文映射
export const categoryLabels: Record<ProjectCategory | 'all', string> = {
  'all': '全部',
  [ProjectCategory.PLUGIN]: '插件',
  [ProjectCategory.APP]: '应用',
  [ProjectCategory.BLOCKCHAIN]: 'Web3',
  [ProjectCategory.OTHER]: '其他',
};

// 分类颜色映射（用于 ProjectCard 组件）
export const categoryColors: Record<ProjectCategory, string> = {
  'plugin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'app': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'blockchain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

// ==============[ 项目分类标签配置 End ]=================