import type { IndexAppType, ProjectCategory } from "./config";

export interface Project {
    slug: string;
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
    content: string;
    created: string;
    banner?: string;
    tags?: string[];
}

export interface IndexApp {
    id: string;
    name: string;
    icon: string;
    type: IndexAppType;
    url?: string;
    description?: string;
}