import type { IndexAppType, ProjectCategory } from "./config/projects";

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

export interface LifePost {
    id: string;
    title: string;
    content: string;
    date: string;
    images?: string[];
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