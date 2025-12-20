import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { projectConfig } from '../src/config/generate-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const projectDir = path.resolve(rootDir, projectConfig.projectDir);
const indexPath = projectConfig.indexFile.startsWith('/')
  ? `.${projectConfig.indexFile}`
  : projectConfig.indexFile;
const outputFile = path.resolve(rootDir, indexPath);

/**
 * 从文件名提取标题（去除扩展名）
 * @param {string} filename - 文件名
 * @returns {string} - 标题
 */
function getTitleFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

/**
 * 生成 slug：优先用 frontmatter.slug，其次标题，最后文件名
 * @param {object} frontmatter
 * @param {string} filename
 */
function resolveSlug(frontmatter, filename) {
  const source =
    frontmatter.slug ||
    frontmatter.title ||
    getTitleFromFilename(filename);

  return String(source)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    || getTitleFromFilename(filename).toLowerCase().replace(/\s+/g, '-');
}

/**
 * 生成项目索引
 */
function generateProjectIndex() {
  try {
    const cacheDir = path.dirname(outputFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const files = fs.readdirSync(projectDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('.'));

    const projects = [];

    for (const file of files) {
      const filePath = path.join(projectDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // 仅读取 frontmatter
      const { data: frontmatter } = matter(fileContent);

      const project = {
        slug: resolveSlug(frontmatter, file),
        title: frontmatter.title || getTitleFromFilename(file),
        created: frontmatter.created || '',
        category: frontmatter.category || 'other',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        banner: frontmatter.banner || '',
        demoUrl: frontmatter.demoUrl || '',
        downloadUrl: frontmatter.downloadUrl || '',
        githubUrl: frontmatter.githubUrl || '',
        description: frontmatter.description || '',
      };

      projects.push(project);
    }

    // 按创建时间倒序排序（最新在前）；缺失 created 的排后
    projects.sort((a, b) => {
      if (!a.created && !b.created) return 0;
      if (!a.created) return 1;
      if (!b.created) return -1;
      return new Date(b.created) - new Date(a.created);
    });

    fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2), 'utf-8');

    console.log(`✅ 成功生成项目索引：${projects.length} 个项目`);
    console.log(`   输出文件：${outputFile}`);
  } catch (error) {
    console.error('❌ 生成项目索引失败：', error);
    process.exit(1);
  }
}

// 执行生成
generateProjectIndex();

