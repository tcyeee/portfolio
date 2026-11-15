import { useEffect, useRef, useState } from 'react'
import type { Project } from '../domain'

interface Props {
  projects: Project[]
}

// 图标从「刚进入视野」的小尺寸，一路放大到这个尺寸后，布局才开始左移。
const ICON_START = 45
const ICON_END = 176
// 背景圆形画布的放大速度是图标的 3 倍，所以会先于图标铺满整屏。
const CIRCLE_SPEED = 3

// 每个插件用不同的强调色区分图标色块，弥补目前所有插件共用同一张图标素材的问题。
const ACCENT_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#0EA5E9', '#EF4444', '#8B5CF6']

// 下载量形如 "4k" / "4"，索引脚本未对该字段做类型归一化，frontmatter 写的纯数字会变成 number 而非 string，这里统一转成字符串再解析。
function parseDownloads(value?: string | number): number {
  const match = value === undefined ? null : String(value).trim().match(/^([\d.]+)\s*([km]?)$/i)
  if (!match) return 0
  const n = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  return unit === 'k' ? n * 1_000 : unit === 'm' ? n * 1_000_000 : n
}

// downloads 现在是构建时从 Obsidian 官方统计数据拉取的精确整数（见 generate-project-index.js），
// 这里只负责展示时的千分位压缩，比如 2050 -> "2.1k"，4 这种个位数原样显示。
function formatDownloads(value?: string | number): string {
  const n = parseDownloads(value)
  if (n <= 0) return ''
  if (n < 1000) return String(n)
  const thousands = n / 1000
  const rounded = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10
  return `${rounded}k`
}

export default function ObsidianReveal({ projects }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [contentWidth, setContentWidth] = useState(0)

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
      setContentWidth(contentRef.current?.clientWidth ?? 0)
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

  const sortedProjects = [...projects].sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads))

  // 第一阶段（progress 0 -> 0.5）：图标和背景画布原地放大。
  // 第二阶段（progress 0.5 -> 1）：图标左移腾位置，右侧插件列表浮现。
  const growT = Math.min(1, progress / 0.5)
  const shiftT = Math.max(0, Math.min(1, (progress - 0.5) / 0.5))

  const circleT = Math.min(1, growT * CIRCLE_SPEED)
  const iconSize = ICON_START + (ICON_END - ICON_START) * growT
  const canvasDiameter = circleT * Math.hypot(viewport.width, viewport.height) * 1.15
  // 以内容区（而非整个视口）的宽度为基准左移，避免宽屏下图标被甩到离插件列表很远的地方。
  const iconShiftX = -shiftT * contentWidth * 0.28

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
            opacity: 1 - shiftT * 0.45,
            background: 'radial-gradient(circle at 35% 30%, #FBF4E4 0%, #ECDDB8 55%, #D6BF8F 100%)',
          }}
        />

        {/* 居中、限宽的内容容器：图标和列表都相对它定位，宽屏下不会被甩到视口边缘 */}
        <div ref={contentRef} className="relative mx-auto h-full max-w-6xl">
          {/* 左侧固定侧栏：大图标 + 标题 + 插件数量，作为整个版块的锚点 */}
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
            <p className="mt-6 whitespace-nowrap text-center font-semibold text-stone-700" style={{ opacity: growT, fontSize: 18 + growT * 10 }}>
              Obsidian 插件
            </p>
            <p
              className="mt-2 whitespace-nowrap text-center text-sm text-stone-700/60"
              style={{ opacity: shiftT }}>
              {projects.length} 款插件 · 持续更新
            </p>
          </div>

          {/* 右侧纵向列表：类似 App Store 列表行，按下载量从高到低排序 */}
          <div
            aria-hidden={shiftT < 0.05}
            className="absolute right-0 top-1/2 w-full max-w-xl px-6 md:px-12"
            style={{
              opacity: shiftT,
              transform: `translateY(-50%) translateX(${(1 - shiftT) * 60}px)`,
              pointerEvents: shiftT > 0.5 ? 'auto' : 'none',
            }}>
            <div className="divide-y divide-stone-900/10 rounded-2xl border border-stone-900/10 bg-stone-900/[0.03] backdrop-blur-md">
              {sortedProjects.map((project, i) => (
                <a
                  key={project.slug}
                  href={`/project/${project.slug}`}
                  tabIndex={shiftT < 0.05 ? -1 : undefined}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-stone-900/5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}1A` }}>
                    <img src="/icons/falling/obsidian.svg" alt="" aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold leading-snug text-stone-800">{project.title}</h3>
                    <p className="truncate text-xs leading-snug text-stone-700/70">{project.description}</p>
                  </div>
                  {project.downloads && (
                    <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-stone-700/60">⬇ {formatDownloads(project.downloads)}</span>
                  )}
                </a>
              ))}
            </div>
            <a
              href="https://community.obsidian.md/users/lucas"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={shiftT < 0.05 ? -1 : undefined}
              className="mt-4 inline-block rounded-lg bg-stone-800 px-5 py-2.5 text-sm font-semibold text-[#F9F6F0] transition hover:bg-stone-700">
              查看Obsidian开发者页面 →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
