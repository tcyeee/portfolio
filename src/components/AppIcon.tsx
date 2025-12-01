import type { App } from '../config/projects';

interface Props {
  app: App;
}

export default function AppIcon({ app }: Props) {
  // 获取图标本身的样式（圆角）
  const getIconStyle = () => {
    switch (app.type) {
      case 'app':
        // 应用图标 - 方圆形（圆角矩形）
        return 'rounded-2xl';
      case 'miniprogram':
        // 小程序图标 - 圆形
        return 'rounded-full';
      case 'plugin':
        // 插件图标 - 方圆形
        return 'rounded-2xl';
      default:
        return 'rounded-2xl';
    }
  };

  // 获取容器的样式（插件需要外部虚线边框）
  const getContainerStyle = () => {
    if (app.type === 'plugin') {
      // 插件图标 - 外部带有虚线的方圆形
      return 'p-1 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-2xl';
    }
    return '';
  };

  const content = (
    <div className={`relative ${getIconStyle()} overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group w-full h-full`}>
      <img
        src={app.icon}
        alt={app.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // 如果图片加载失败，显示占位符
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EIcon%3C/text%3E%3C/svg%3E';
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
    </div>
  );

  if (app.url) {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full h-full ${getContainerStyle()} hover:scale-105 transition-transform duration-300`}
        title={app.description || app.name}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={`block w-full h-full ${getContainerStyle()}`} title={app.description || app.name}>
      {content}
    </div>
  );
}

