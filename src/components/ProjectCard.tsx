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

  const cardContent = (
    <div className="flex flex-col h-full">
      {(project.preview || project.banner) && (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={project.preview || project.banner}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[project.category]}`}>
            {categoryLabels[project.category]}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4 max-h-16 overflow-hidden">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              <span className="icon-github"></span>
              查看代码 →
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              在线演示 →
            </a>
          )}
          {project.downloadUrl && (
            <a
              href={project.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              下载地址 →
            </a>
          )}
        </div>
        {project.created && (
          <div className="mt-auto pt-2 text-xs text-gray-500 dark:text-gray-400">
            {project.created}
          </div>
        )}
      </div>
    </div>
  );

  if (slug) {
    return (
      <a
        href={`/project/${slug}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer h-full"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
      {cardContent}
    </div>
  );
}

