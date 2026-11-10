import type { IndexAppType, ProjectCategory } from "./config";

export interface Project {
    slug: string;
    file?: string;   // 源 Markdown 文件名（由索引生成脚本写入）
    title: string;   // 项目标题
    created: string; // 创建时间
    category: ProjectCategory;  // 项目分类
    tags: string[]; // 标签
    banner?: string; // 横幅图片
    preview?: string; // 预览图片
    demoUrl?: string; // 在线演示地址
    downloadUrl?: string; // 下载地址
    githubUrl?: string; // GitHub地址
    description: string; // 项目描述
}

export interface Article {
    slug: string;
    title: string;
    content: string;  // 列表页摘要（正文第一段截断）
    created: string;
    category: string; // 分类（frontmatter.category，缺省为「未分类」）
    banner?: string;
    tags?: string[];
    pinned?: boolean; // 是否置顶
    wordCount: number; // 正文字数
    readingMinutes: number; // 预计阅读分钟数
}

export interface IndexApp {
    id: string;
    name: string;
    icon: string;
    type: IndexAppType;
    url?: string;
    description?: string;
}