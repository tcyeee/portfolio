import type { IndexApp } from '../domain';

interface Props {
  app: IndexApp;
}

export default function AppIcon({ app }: Props) {
  // 获取容器的样式（插件需要外部虚线边框）
  const containerStyle = app.type === 'plugin' 
    ? 'p-1 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-2xl'
    : '';

  const imageContent = (
    <>
      <img
        src={app.icon}
        alt={app.name}
        className={``}
        onError={(e) => {
          // 如果图片加载失败，显示占位符
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EIcon%3C/text%3E%3C/svg%3E';
        }}
      />
      <div className={``} />
    </>
  );

  if (app.url) {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full h-full ${containerStyle} hover:scale-105 transition-transform duration-300 group relative`}
        title={app.description || app.name}
      >
        {imageContent}
      </a>
    );
  }

  return (
    <div className={`block w-full h-full ${containerStyle} group relative`} title={app.description || app.name}>
      {imageContent}
    </div>
  );
}

