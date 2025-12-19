import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { articleConfig } from '../src/config/generate-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const articleDir = path.join(rootDir, articleConfig.articleDir);
const outputFile = path.join(rootDir, articleConfig.indexFile);

/**
 * 提取文章的第一段内容（最多指定字符数）
 * @param {string} content - Markdown 内容（已去除 frontmatter）
 * @param {number} maxLength - 最大字符数
 * @returns {string} - 提取的内容摘要
 */
function extractFirstParagraph(content, maxLength = articleConfig.contentMaxLength) {
  // 按行分割内容
  const lines = content.split('\n');
  
  // 找到第一个非空、非标题的实际内容行
  let firstContentLine = '';
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过空行
    if (!trimmedLine) continue;
    
    // 跳过标题行（以 # 开头）
    if (trimmedLine.startsWith('#')) continue;
    
    // 跳过分隔线
    if (/^-{3,}$/.test(trimmedLine)) continue;
    
    // 找到第一段实际内容
    firstContentLine = trimmedLine;
    break;
  }
  
  if (!firstContentLine) {
    // 如果没有找到，则处理整个内容
    firstContentLine = content;
  }
  
  // 移除所有 Markdown 格式标记（**、*、`、[]、()等）
  let text = firstContentLine
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/`([^`]+)`/g, '$1') // 代码
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 链接
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // 图片
    .replace(/\|/g, ' ') // 表格分隔符
    .replace(/-{3,}/g, '') // 分隔线
    .replace(/\s+/g, ' ') // 移除多余空格
    .trim();
  
  // 提取前 maxLength 个字符
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  
  return text || '';
}

/**
 * 从文件名提取标题（去除扩展名）
 * @param {string} filename - 文件名
 * @returns {string} - 标题
 */
function getTitleFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

/**
 * 从文件名生成 slug（用于 URL）
 * @param {string} filename - 文件名
 * @returns {string} - slug
 */
function getSlugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

/**
 * 生成文章索引
 */
function generateArticleIndex() {
  try {
    // 确保输出目录存在
    const cacheDir = path.dirname(outputFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 读取所有 Markdown 文件
    const files = fs.readdirSync(articleDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('.'));

    const articles = [];

    for (const file of files) {
      const filePath = path.join(articleDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 使用 gray-matter 解析 frontmatter
      const { data: frontmatter, content } = matter(fileContent);

      // 提取所需字段
      const article = {
        slug: getSlugFromFilename(file),
        title: frontmatter.title || getTitleFromFilename(file),
        content: extractFirstParagraph(content, articleConfig.contentMaxLength),
        created: frontmatter.created || '',
        tags: frontmatter.tags || [],
        banner: frontmatter.banner || '',
      };

      articles.push(article);
    }

    // 按创建时间倒序排序（最新的在前）
    articles.sort((a, b) => {
      if (!a.created && !b.created) return 0;
      if (!a.created) return 1;
      if (!b.created) return -1;
      return new Date(b.created) - new Date(a.created);
    });

    // 写入 JSON 文件
    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf-8');
    
    console.log(`✅ 成功生成文章索引：${articles.length} 篇文章`);
    console.log(`   输出文件：${outputFile}`);
  } catch (error) {
    console.error('❌ 生成文章索引失败：', error);
    process.exit(1);
  }
}

// 执行生成
generateArticleIndex();

