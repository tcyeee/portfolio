import { useMemo } from 'react';
import type { App } from '../domain';
import { appCloudConfig } from '../config/projects';
import AppIcon from './AppIcon';

interface Props {
  apps: App[];
}

interface Position {
  left: number;
  top: number;
  size: number;
  rotation: number;
}

// 简单的哈希函数，用于基于 ID 生成一致的伪随机值
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 生成基于 ID 的伪随机值（0-1之间）
function randomFromId(id: string, seed: number = 0): number {
  const hash = hashString(id + seed.toString());
  return (hash % 1000) / 1000;
}

// 检查两个圆形是否重叠
function circlesOverlap(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
  minSpacing: number = 20
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = r1 + r2 + minSpacing; // 添加最小间距
  return distance < minDistance;
}

// 计算布局，避免重叠
function calculateLayout(apps: App[], containerHeight: number): Position[] {
  const positions: Position[] = [];
  // 使用较大的容器尺寸进行计算，实际显示会通过CSS响应式调整
  const containerWidth = 1200;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // 根据容器高度动态调整最大半径和最小间距
  const containerAspectRatio = containerWidth / containerHeight;
  const maxRadius = Math.min(containerWidth * 0.45, containerHeight * 0.45);
  const minSpacing = Math.max(25, containerHeight * 0.05); // 最小间距，至少25px或容器高度的5%

  // 先计算所有元素的大小，根据容器高度动态调整
  const sizeScale = Math.min(1, containerHeight / 600); // 如果高度小于600px，缩小元素
  const elements = apps.map((app, i) => {
    const r1 = randomFromId(app.id, 1);
    const r4 = randomFromId(app.id, 4);
    // 基础大小范围：50-120px，根据容器高度缩放
    const baseSize = (50 + (r1 * 70)) * sizeScale;
    const typeMultiplier = app.type === 'app' ? 1.0 : app.type === 'miniprogram' ? 0.9 : 0.85;
    const size = Math.max(40, baseSize * typeMultiplier); // 最小40px
    const rotation = -20 + (r4 * 40);
    return { app, size, rotation, radius: size / 2, index: i };
  });

  // 按大小排序，先放置大的元素
  elements.sort((a, b) => b.size - a.size);

  for (const element of elements) {
    const { app, rotation } = element;
    let { size, radius } = element; // 使用 let 以便在需要时修改
    const r2 = randomFromId(app.id, 2);
    
    // 使用螺旋布局算法
    let found = false;
    let x = 0;
    let y = 0;
    let attempts = 0;
    const maxAttempts = 500;
    
    // 起始角度基于ID
    const baseAngle = r2 * Math.PI * 2;
    
    while (!found && attempts < maxAttempts) {
      // 螺旋算法：角度逐渐增加，半径逐渐增大
      const spiralTurns = Math.floor(attempts / 12);
      const angleInSpiral = (attempts % 12) * (Math.PI / 6);
      const angle = baseAngle + spiralTurns * Math.PI + angleInSpiral;
      
      // 半径随尝试次数增加
      const spiralRadius = Math.min(
        maxRadius,
        (spiralTurns * 40) + (angleInSpiral / (Math.PI / 6)) * 15
      );
      
      x = centerX + Math.cos(angle) * spiralRadius;
      y = centerY + Math.sin(angle) * spiralRadius;
      
      // 确保在容器内（留出边距）
      const margin = radius + minSpacing;
      x = Math.max(margin, Math.min(containerWidth - margin, x));
      y = Math.max(margin, Math.min(containerHeight - margin, y));
      
      // 检查是否与已放置的元素重叠
      let overlaps = false;
      for (const pos of positions) {
        const posRadius = pos.size / 2;
        // 使用百分比位置计算实际像素位置
        const posX = (pos.left / 100) * containerWidth;
        const posY = (pos.top / 100) * containerHeight;
        
        if (circlesOverlap(x, y, radius, posX, posY, posRadius, minSpacing)) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        found = true;
      }
      
      attempts++;
    }
    
    // 如果仍然找不到位置，尝试更激进的策略
    if (!found) {
      // 策略1: 尝试更密集的网格搜索
      const gridSize = Math.max(20, minSpacing);
      const gridAttempts = Math.min(200, Math.floor((containerWidth * containerHeight) / (gridSize * gridSize)));
      
      for (let i = 0; i < gridAttempts; i++) {
        const gridR = randomFromId(app.id, 2000 + i);
        const gridX = (gridR * 0.8 + 0.1) * containerWidth; // 10% 到 90%
        const gridY = (randomFromId(app.id, 3000 + i) * 0.8 + 0.1) * containerHeight;
        
        const margin = radius + minSpacing * 0.5;
        x = Math.max(margin, Math.min(containerWidth - margin, gridX));
        y = Math.max(margin, Math.min(containerHeight - margin, gridY));
        
        let overlaps = false;
        for (const pos of positions) {
          const posRadius = pos.size / 2;
          const posX = (pos.left / 100) * containerWidth;
          const posY = (pos.top / 100) * containerHeight;
          
          if (circlesOverlap(x, y, radius, posX, posY, posRadius, minSpacing * 0.8)) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          found = true;
          break;
        }
      }
      
      // 策略2: 如果还是找不到，尝试缩小元素（最后手段）
      if (!found && radius > 30) {
        const reducedRadius = radius * 0.8;
        const reducedSize = reducedRadius * 2;
        
        // 重新尝试放置缩小后的元素
        for (let i = 0; i < 100; i++) {
          const tryR = randomFromId(app.id, 4000 + i);
          const tryAngle = tryR * Math.PI * 2;
          const tryRadius = (i % 5) * 20 + 30;
          
          x = centerX + Math.cos(tryAngle) * tryRadius;
          y = centerY + Math.sin(tryAngle) * tryRadius;
          
          const margin = reducedRadius + minSpacing * 0.5;
          x = Math.max(margin, Math.min(containerWidth - margin, x));
          y = Math.max(margin, Math.min(containerHeight - margin, y));
          
          let overlaps = false;
          for (const pos of positions) {
            const posRadius = pos.size / 2;
            const posX = (pos.left / 100) * containerWidth;
            const posY = (pos.top / 100) * containerHeight;
            
            if (circlesOverlap(x, y, reducedRadius, posX, posY, posRadius, minSpacing * 0.8)) {
              overlaps = true;
              break;
            }
          }
          
          if (!overlaps) {
            found = true;
            // 更新实际使用的尺寸
            size = reducedSize;
            radius = reducedRadius;
            break;
          }
        }
      }
    }
    
    // 如果仍然找不到位置，强制放置在边缘（最后手段，可能会轻微重叠）
    if (!found) {
      const edgeR = randomFromId(app.id, 5000);
      const edgeAngle = edgeR * Math.PI * 2;
      x = centerX + Math.cos(edgeAngle) * (maxRadius * 0.95);
      y = centerY + Math.sin(edgeAngle) * (maxRadius * 0.95);
      
      const margin = radius + 5;
      x = Math.max(margin, Math.min(containerWidth - margin, x));
      y = Math.max(margin, Math.min(containerHeight - margin, y));
    }
    
    // 转换为百分比
    positions.push({
      left: (x / containerWidth) * 100,
      top: (y / containerHeight) * 100,
      size,
      rotation,
    });
  }
  
  return positions;
}

export default function AppList({ apps }: Props) {
  // 从配置文件中读取高度设置
  const containerHeight = appCloudConfig.height.desktop;
  const layouts = useMemo(() => calculateLayout(apps, containerHeight), [apps, containerHeight]);

  if (apps.length === 0) {
    return null;
  }

  return (
    <section className="mb-20 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        APP列表
      </h2>
      <div 
        className="relative w-full mx-auto max-w-6xl overflow-hidden app-cloud-container"
        style={{
          '--mobile-height': `${appCloudConfig.height.mobile}px`,
          '--tablet-height': `${appCloudConfig.height.tablet}px`,
          '--desktop-height': `${appCloudConfig.height.desktop}px`,
        } as React.CSSProperties}
      >
        {apps.map((app, index) => {
          const layout = layouts[index];
          
          return (
            <div
              key={app.id}
              className="absolute flex flex-col items-center group cursor-pointer transition-all duration-500 hover:z-50 hover:scale-125"
              style={{
                left: `${layout.left}%`,
                top: `${layout.top}%`,
                transform: `translate(-50%, -50%) rotate(${layout.rotation}deg)`,
                width: `${layout.size}px`,
                height: `${layout.size}px`,
              }}
            >
              <div 
                className="w-full h-full transition-transform duration-500 group-hover:rotate-0 group-hover:drop-shadow-2xl"
                style={{ transform: `rotate(${-layout.rotation}deg)` }}
              >
                <AppIcon app={app} />
              </div>
              <span 
                className="mt-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-[140px] truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap opacity-90 group-hover:opacity-100"
                style={{ transform: `rotate(${-layout.rotation}deg)` }}
              >
                {app.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

