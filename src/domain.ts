import type { IndexAppType, ProjectCategory } from "./config";

export interface Project {
    id: string;
    title: string;
    description: string;
    category: ProjectCategory;
    tags: string[];
    image?: string;
    githubUrl?: string;
    demoUrl?: string;
    featured?: boolean;
    year: number;
}

export interface Article {
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