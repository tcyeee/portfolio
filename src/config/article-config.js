/**
 * 文章配置 - 统一管理文章目录和索引文件路径
 * 
 * 修改此文件后，以下位置会自动更新：
 * - src/pages/article/[slug].astro（文章文件读取路径）
 * - scripts/generate-article-index.js（索引生成脚本）
 * 
 * ⚠️ 注意：src/config/index.ts 中的导入路径需要手动同步修改
 * 因为 Astro 的静态导入限制，导入路径必须是字面量字符串
 */
export const articleConfig = {
  // 文章所在目录（相对于 public 目录）
  articleDir: 'public/articles',
  // 索引文件路径（相对于 public 目录）
  indexFile: '/src/config/cache/articles.json',
  // 提取文章第一段内容的字数限制
  contentMaxLength: 100,
};

