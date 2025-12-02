import type { IndexApp } from '../domain';
import { appCloudConfig } from '../config/projects';
import AppIcon from './AppIcon';

interface Props {
  apps: IndexApp[];
}

export default function AppList({ apps }: Props) {
  if (apps.length === 0) {
    return null;
  }

  return (
    <section className="mb-20 px-4">
      <div className="w-full mx-auto" style={{ width: '75%' }}>
        <div 
          className="grid justify-center app-grid"
          style={{
            '--icon-size-mobile': `${appCloudConfig.iconSize.mobile}px`,
            '--icon-size-tablet': `${appCloudConfig.iconSize.tablet}px`,
            '--icon-size-desktop': `${appCloudConfig.iconSize.desktop}px`,
            '--gap-mobile': `${appCloudConfig.gap.mobile}px`,
            '--gap-tablet': `${appCloudConfig.gap.tablet}px`,
            '--gap-desktop': `${appCloudConfig.gap.desktop}px`,
            '--cols-mobile': appCloudConfig.itemsPerRow.mobile,
            '--cols-tablet': appCloudConfig.itemsPerRow.tablet,
            '--cols-desktop': appCloudConfig.itemsPerRow.desktop,
          } as React.CSSProperties}
        >
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-110"
            >
              <div 
                className="w-[var(--icon-size-mobile)] h-[var(--icon-size-mobile)] md:w-[var(--icon-size-tablet)] md:h-[var(--icon-size-tablet)] lg:w-[var(--icon-size-desktop)] lg:h-[var(--icon-size-desktop)] transition-transform duration-300 overflow-visible"
              >
                <AppIcon app={app} />
              </div>
              <span 
                className="mt-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-[80px] md:max-w-[90px] lg:max-w-[100px] truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              >
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

