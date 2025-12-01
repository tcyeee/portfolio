import type { App } from '../config/projects';
import AppIcon from './AppIcon';

interface Props {
  apps: App[];
}

export default function AppList({ apps }: Props) {
  if (apps.length === 0) {
    return null;
  }

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        APP列表
      </h2>
      <div className="flex flex-wrap gap-8 justify-center items-start">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-28 h-28 mb-3">
              <AppIcon app={app} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-[112px] truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {app.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

