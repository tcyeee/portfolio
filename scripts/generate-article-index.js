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
  
  // 找到第一段实际内容：跳过开头的空行/标题/分隔线，然后收集连续的内容行直到遇到空行
  const paragraphLines = [];
  for (const line of lines) {
    const trimmedLine = line.trim();

    // 引用块（`> …`）的内容本身可以作为摘要，但引用符号不应出现在列表里
    const withoutQuote = trimmedLine.replace(/^>\s?/, '');

    if (paragraphLines.length === 0) {
      // 段落尚未开始：跳过空行、标题行、分隔线
      if (!withoutQuote) continue;
      if (withoutQuote.startsWith('#')) continue;
      if (/^-{3,}$/.test(withoutQuote)) continue;
      paragraphLines.push(withoutQuote);
    } else {
      // 段落已开始：遇到空行即结束
      if (!trimmedLine) break;
      paragraphLines.push(withoutQuote);
    }
  }

  let firstParagraph = paragraphLines.join(' ');

  if (!firstParagraph) {
    // 如果没有找到，则处理整个内容
    firstParagraph = content;
  }

  // 移除所有 Markdown 格式标记（**、*、`、[]、()等）
  let text = firstParagraph
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
 * 统计正文字数与估算阅读时间（分钟）。
 * 口径与 src/utils/markdown.ts 的 estimateWordCount / estimateReadingMinutes 保持一致：
 * 中文按字符数（约 400 字/分钟），英文按单词数（约 200 词/分钟），
 * 统计前去除代码块、数学公式和图片/链接等不计入阅读内容的部分。
 * （该脚本以纯 Node 运行，无法直接 import .ts 文件，故在此复制一份同口径实现。）
 * @param {string} content - Markdown 内容（已去除 frontmatter）
 * @returns {{ wordCount: number, readingMinutes: number }}
 */
function estimateStats(content) {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-=|]/g, '');

  const cjkCount = (stripped.match(/[一-龥]/g) || []).length;
  const englishWordCount = (stripped.replace(/[一-龥]/g, '').match(/[a-zA-Z0-9]+/g) || []).length;

  const wordCount = cjkCount + englishWordCount;
  const readingMinutes = Math.max(1, Math.round(cjkCount / 400 + englishWordCount / 200));
  return { wordCount, readingMinutes };
}

/**
 * 规范化分类字段：frontmatter 里可能写成字符串、数组或留空，
 * 统一取第一个非空值，缺省时落到配置中的默认分类。
 * @param {unknown} raw - frontmatter 中的 category 字段
 * @returns {string} - 分类名
 */
function normalizeCategory(raw) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const text = typeof value === 'string' ? value.trim() : '';
  return text || articleConfig.defaultCategory;
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
      const { wordCount, readingMinutes } = estimateStats(content);
      const article = {
        slug: getSlugFromFilename(file),
        title: frontmatter.title || getTitleFromFilename(file),
        content: extractFirstParagraph(content, articleConfig.contentMaxLength),
        created: frontmatter.created || '',
        category: normalizeCategory(frontmatter.category),
        tags: frontmatter.tags || [],
        banner: frontmatter.banner || '',
        pinned: frontmatter.pinned === true,
        wordCount,
        readingMinutes,
      };

      articles.push(article);
    }

    // 置顶文章排在最前，其余按创建时间倒序排序（最新的在前）
    articles.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
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

