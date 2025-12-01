// 项目分类类型定义
export type ProjectCategory = 'plugin' | 'app' | 'blockchain' | 'other' | '3D-Printer';

// 所有分类（包含 'all' 用于筛选）
export const categories = ['all', 'plugin', 'app', 'blockchain', '3D-Printer'] as const;

// 分类标签映射
export const categoryLabels: Record<ProjectCategory | 'all', string> = {
  all: '全部',
  'plugin': '插件',
  'app': '应用',
  'blockchain': 'Web3',
  '3D-Printer': '3D打印',
  'other': '其他',
};

// 分类颜色映射（用于 ProjectCard 组件）
export const categoryColors: Record<ProjectCategory, string> = {
  'plugin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'app': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'blockchain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  '3D-Printer': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};
