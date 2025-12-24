import type React from 'react';
import { categoryColors, categoryLabels } from '../config';
import type { Project } from '../domain';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const slug = project.slug || '';
  const cardBaseClass =
    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-700/60 dark:bg-gray-800/90';

  const cardContent = (
    <div className="flex h-full flex-col">
      {(project.preview || project.banner) && (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={project.preview || project.banner}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${categoryColors[project.category]}`}
          >
            {categoryLabels[project.category]}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 text-xl font-bold leading-tight text-gray-900 dark:text-white">{project.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
                <span>演示</span>
              </a>
            )}
            {project.downloadUrl && (
              <a
                href={project.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                aria-label="下载"
              >
                <span className="icon-download icon-size-22 text-current" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                aria-label="GitHub" >
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

  if (slug) {
    return (
      <a
        href={`/project/${slug}`}
        className={cardBaseClass}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className={cardBaseClass}>
      {cardContent}
    </div>
  );
}

