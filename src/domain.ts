import type { IndexAppType, ProjectCategory } from "./config";

export interface Project {
    slug: string;
    title: string;
    created: string;
    category: ProjectCategory;
    tags: string[];
    banner?: string;
    demoUrl?: string;
    githubUrl?: string;
    description: string;
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