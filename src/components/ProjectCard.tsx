import type { Project } from '../domain';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const categoryLabels: Record<Project['category'], string> = {
    'web-extension': '网页插件',
    'obsidian-plugin': 'Obsidian插件',
    'web-app': 'Web应用',
    'blockchain': '区块链应用',
    'other': '其他',
    '3D-Printer': '3D打印',
  };

  const categoryColors: Record<Project['category'], string> = {
    'web-extension': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'obsidian-plugin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'web-app': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'blockchain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    '3D-Printer': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      {project.image && (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
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
        <div className="flex flex-wrap gap-2 mb-4">
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
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              查看代码 →
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              在线演示 →
            </a>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {project.year}
        </div>
      </div>
    </div>
  );
}

