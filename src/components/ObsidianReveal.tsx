import { useEffect, useRef, useState } from 'react'
import type { Project } from '../domain'

interface Props {
  projects: Project[]
}

// 图标从「刚进入视野」的小尺寸，一路放大到这个尺寸后，布局才开始左移。
const ICON_START = 56
const ICON_END = 300
// 背景圆形画布的放大速度是图标的 3 倍，所以会先于图标铺满整屏。
const CIRCLE_SPEED = 3

export default function ObsidianReveal({ projects }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let ticking = false

    const update = () => {
      ticking = false
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      onScroll()
    }

    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  if (projects.length === 0) return null

  // 第一阶段（progress 0 -> 0.5）：图标和背景画布原地放大。
  // 第二阶段（progress 0.5 -> 1）：图标左移腾位置，右侧插件列表浮现。
  const growT = Math.min(1, progress / 0.5)
  const shiftT = Math.max(0, Math.min(1, (progress - 0.5) / 0.5))

  const circleT = Math.min(1, growT * CIRCLE_SPEED)
  const iconSize = ICON_START + (ICON_END - ICON_START) * growT
  const canvasDiameter = circleT * Math.hypot(viewport.width, viewport.height) * 1.15
  const iconShiftX = -shiftT * viewport.width * 0.28

  return (
    <div id="obsidian-reveal" ref={sectionRef} className="relative" style={{ height: '240vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F9F6F0] dark:bg-gray-900">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: canvasDiameter,
            height: canvasDiameter,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 35% 30%, #7c3aed 0%, #5b21b6 55%, #3b0764 100%)',
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 flex flex-col items-center"
          style={{ transform: `translate(calc(-50% + ${iconShiftX}px), -50%)` }}>
          <img
            src="/icons/falling/obsidian.svg"
            alt="Obsidian"
            width={ICON_END}
            height={ICON_END}
            style={{
              width: iconSize,
              height: iconSize,
              filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.35))',
            }}
          />
          <p className="mt-6 whitespace-nowrap text-center font-semibold text-white" style={{ opacity: growT, fontSize: 18 + growT * 10 }}>
            Obsidian 作品
          </p>
        </div>

        <div
          aria-hidden={shiftT < 0.05}
          className="absolute right-0 top-1/2 w-full max-w-md px-6 md:px-12"
          style={{
            opacity: shiftT,
            transform: `translateY(-50%) translateX(${(1 - shiftT) * 60}px)`,
            pointerEvents: shiftT > 0.5 ? 'auto' : 'none',
          }}>
          <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-2">
            {projects.map((project) => (
              <a
                key={project.slug}
                href={`/project/${project.slug}`}
                tabIndex={shiftT < 0.05 ? -1 : undefined}
                className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-colors hover:bg-white/20">
                <h3 className="font-semibold text-white">{project.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/70">{project.description}</p>
              </a>
            ))}
          </div>
          <a
            href="https://github.com/tcyeee"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={shiftT < 0.05 ? -1 : undefined}
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-white/90">
            在 GitHub 查看更多 →
          </a>
        </div>
      </div>
    </div>
  )
}
