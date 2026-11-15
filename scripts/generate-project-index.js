import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { projectConfig } from '../src/config/generate-config.js';
import { resolveSlug } from '../src/utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const projectDir = path.resolve(rootDir, projectConfig.projectDir);
const indexPath = projectConfig.indexFile.startsWith('/')
  ? `.${projectConfig.indexFile}`
  : projectConfig.indexFile;
const outputFile = path.resolve(rootDir, indexPath);

// Obsidian 官方维护的社区插件下载量统计文件，键是 manifest.json 里的 plugin id。
const OBSIDIAN_PLUGIN_STATS_URL = 'https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json';

/**
 * 给设置了 pluginId 的项目，用 Obsidian 官方统计数据覆盖 frontmatter 里手填的 downloads。
 * 网络请求失败时不影响构建，静默保留 frontmatter 原值。
 * @param {Array<{pluginId?: string, downloads?: string}>} projects
 */
async function applyLiveObsidianDownloads(projects) {
  const pluginIds = projects.filter((p) => p.pluginId).map((p) => p.pluginId);
  if (pluginIds.length === 0) return;

  try {
    const res = await fetch(OBSIDIAN_PLUGIN_STATS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stats = await res.json();

    for (const project of projects) {
      if (!project.pluginId) continue;
      const downloads = stats[project.pluginId]?.downloads;
      if (typeof downloads === 'number') {
        project.downloads = String(downloads);
      } else {
        console.warn(`⚠️ 未在 Obsidian 官方统计数据里找到插件 "${project.pluginId}"，downloads 保留 frontmatter 原值`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ 拉取 Obsidian 插件下载量失败，downloads 保留 frontmatter 原值：${error.message}`);
  }
}


/**
 * 规范化日期：只保留 YYYY-MM-DD
 * @param {unknown} value
 * @returns {string}
 */
function normalizeDate(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成项目索引
 */
async function generateProjectIndex() {
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
        file,
        title: frontmatter.title || file.replace(/\.md$/, ''),
        created: normalizeDate(frontmatter.created),
        category: frontmatter.category || 'other',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        banner: frontmatter.banner || '',
        preview: frontmatter.preview || '',
        demoUrl: frontmatter.demoUrl || '',
        downloadUrl: frontmatter.downloadUrl || '',
        githubUrl: frontmatter.githubUrl || '',
        description: frontmatter.description || '',
        downloads: frontmatter.downloads || '',
        pluginId: frontmatter.pluginId || '',
      };

      projects.push(project);
    }

    await applyLiveObsidianDownloads(projects);

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
await generateProjectIndex();

