import { generateArticleIndex } from './generate-article-index.js';

export default function articleIndexIntegration() {
  return {
    name: 'article-index-generator',
    hooks: {
      'astro:config:setup': () => {
        // 在配置设置时生成索引（开发模式和构建模式都会执行）
        try {
          generateArticleIndex();
        } catch (error) {
          console.error('生成文章索引失败:', error);
        }
      },
      'astro:build:start': () => {
        // 在构建开始时再次生成索引（确保最新）
        try {
          generateArticleIndex();
        } catch (error) {
          console.error('生成文章索引失败:', error);
        }
      },
    },
  };
}

