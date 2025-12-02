import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文章目录路径
const articleDir = path.join(__dirname, '../src/config/article');
const cacheDir = path.join(articleDir, 'cache');
const outputFile = path.join(cacheDir, 'index.json');

/**
 * 提取文章第一段内容（最多50字符）
 */
function extractFirstParagraph(content) {
  if (!content) return '';
  
  // 移除 frontmatter 后的内容
  const lines = content.split('\n');
  
  // 找到第一个非空行作为开始
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // 跳过空行和标题行（以 # 开头）
    if (line && !line.startsWith('#')) {
      startIndex = i;
      break;
    }
  }
  
  // 提取第一段
  let paragraph = '';
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      // 遇到空行，第一段结束
      break;
    }
    // 跳过标题行
    if (line.startsWith('#')) {
      continue;
    }
    paragraph += line + ' ';
  }
  
  // 清理并截取（最多50字符，包括"..."）
  paragraph = paragraph.trim();
  if (paragraph.length > 50) {
    // 如果超过50字符，截取47个字符后加上"..."，总共50字符
    paragraph = paragraph.substring(0, 47) + '...';
  }
  
  return paragraph || '';
}

/**
 * 从文件名提取标题（如果没有在 frontmatter 中定义）
 */
function extractTitleFromFilename(filename) {
  // 移除 .md 扩展名
  return filename.replace(/\.md$/, '');
}

/**
 * 读取并处理所有 markdown 文件
 */
function generateArticleIndex() {
  try {
    // 确保缓存目录存在
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // 读取文章目录下的所有文件
    const files = fs.readdirSync(articleDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const articles = [];
    
    for (const file of mdFiles) {
      const filePath = path.join(articleDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 解析 frontmatter
      const { data: frontmatter, content } = matter(fileContent);
      
      // 提取所需字段
      const article = {
        title: frontmatter.title || extractTitleFromFilename(file),
        content: extractFirstParagraph(content),
        created: frontmatter.created || '',
        tags: frontmatter.tags || [],
        banner: frontmatter.banner || '',
      };
      
      articles.push(article);
    }
    
    // 按创建时间排序（最新的在前）
    articles.sort((a, b) => {
      const dateA = new Date(a.created);
      const dateB = new Date(b.created);
      return dateB - dateA;
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

// 导出函数供其他模块使用
export { generateArticleIndex };

// 如果直接运行脚本，执行生成
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || 
    process.argv[1]?.includes('generate-article-index.js')) {
  generateArticleIndex();
}

