import { useState } from 'react';
import { categoryColors, categoryLabels } from '../config';
import type { Project, IndexApp } from '../domain';
import AppIcon from './AppIcon';

interface Props {
  project: Project;
  app?: IndexApp; // 对应的首页 APP 图标（有则悬浮展示在封面图与内容区交界处）
}

export default function ProjectCard({ project, app }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const slug = project.slug || '';
  const cardBaseClass =
    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-700/60 dark:bg-gray-800/90';

  // 卡片本身不能是 <a>：里面还有演示/下载/GitHub/AppIcon 这些独立的链接，
  // <a> 不能嵌套 <a>（会被浏览器的 HTML 解析器拆散，导致和 SSR 结构不一致而 hydration 失败）。
  // 改用「背景占位链接」模式：铺满卡片的透明 <a> 负责点击跳转，独立链接用 z-10 浮在它上面。
  const cardContent = (
    <div className="flex h-full flex-col">
      {slug && <a href={`/project/${slug}`} aria-label={project.title} className="absolute inset-0 z-0" />}
      {(project.preview || project.banner) && (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-600" aria-hidden />
          )}
          <img
            src={project.preview || project.banner}
            alt={project.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            ref={(img) => {
              // client:visible 延迟 hydration，原生 loading="lazy" 可能先于 React 挂载完成，
              // 此时 load 事件已经错过 onLoad 监听器，需要在挂载时补一次 complete 检查。
              if (img?.complete) setImageLoaded(true);
            }}
            style={slug ? { viewTransitionName: `project-image-${slug}` } : undefined}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${categoryColors[project.category]}`}
          >
            {categoryLabels[project.category]}
          </span>
          {project.tags?.includes('Obsidian') && (
            <span
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur dark:bg-gray-900/80"
              title="Obsidian 插件"
            >
              <span className="icon-obsidian icon-size-18 text-violet-600 dark:text-violet-400" aria-hidden />
            </span>
          )}
        </div>
      )}
      {app && (project.preview || project.banner) && (
        <div className="relative z-10 -mt-8 ml-6 h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-lg ring-4 ring-white dark:bg-gray-800 dark:ring-gray-800">
          <AppIcon app={app} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 text-xl font-bold leading-tight text-gray-900 dark:text-white">{project.title}</h3>
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
                <span>演示</span>
              </a>
            )}
            {project.downloadUrl && (
              <a href={project.downloadUrl} target="_blank" rel="noopener noreferrer" aria-label="下载">
                <span className="icon-download icon-size-22 text-current" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <span className="icon-github icon-size-25 text-current" />
              </a>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3 dark:text-gray-300">{project.description}</p>

        {project.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          {project.created && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {/* <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> */}
              <span>创建于 {project.created}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <div className={cardBaseClass}>{cardContent}</div>;
}

