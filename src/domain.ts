export interface Project {
    id: string;
    title: string;
    description: string;
    category: 'web-extension' | 'obsidian-plugin' | 'web-app' | 'blockchain' | 'other';
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

export interface App {
    id: string;
    name: string;
    icon: string;
    type: 'app' | 'miniprogram' | 'plugin';
    url?: string;
    description?: string;
}
