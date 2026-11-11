import { useEffect, useMemo, useRef, useState } from 'react'
import type { Heading } from '../utils/markdown'

interface Props {
  headings: Heading[]
  /** `rail` 为桌面端左侧轨道（带标题与阅读进度条），`list` 为移动端折叠面板里的纯列表 */
  variant?: 'rail' | 'list'
  /** 文章标题：正文 h1 滚出视口后在目录顶部淡入 */
  title?: string
}

// 固定导航栏高度（对应 Layout 中 main 的 pt-24 顶部内边距），用作“阅读线”的位置
const HEADER_OFFSET = 96

/** 进度条探针的字符数，用来换算单个字符宽度 */
const PROBE_CELLS = 10

interface Group {
  head: Heading | null
  subs: Heading[]
}

export default function TableOfContents({ headings, variant = 'rail', title }: Props) {
  const isRail = variant === 'rail'

  // 目录只收录 h2 / h3：更深的层级在窄轨道里会挤成一团
  const items = useMemo(() => headings.filter((heading) => heading.level === 2 || heading.level === 3), [headings])

  const [activeId, setActiveId] = useState('')
  const [progress, setProgress] = useState(0)
  const [cells, setCells] = useState(24)
  const [titleVisible, setTitleVisible] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // 阅读位置：取顶部已越过“阅读线”的最后一个标题。比 IntersectionObserver 的可见性
  // 判断更直接——无论标题间距多大、是否短暂不可见都能命中。
  useEffect(() => {
    if (items.length === 0) return
    let ticking = false

    const update = () => {
      ticking = false
      const elements = items
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => el !== null)

      if (elements.length > 0) {
        let current = elements[0].id
        for (const el of elements) {
          if (el.getBoundingClientRect().top - HEADER_OFFSET <= 1) current = el.id
          else break
        }
        setActiveId(current)
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  // 正文 h1 完全滚出视口上方后，在目录顶部补一个文章标题
  useEffect(() => {
    if (!isRail || !title) return
    const h1 = document.querySelector('main h1')
    if (!h1) return
    const observer = new IntersectionObserver(([entry]) => {
      setTitleVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
    })
    observer.observe(h1)
    return () => observer.disconnect()
  }, [isRail, title])

  // 当前标题滚出目录可视区域时把它带回来（只做最小滚动，避免目录跟着乱跳）
  useEffect(() => {
    // 只在轨道模式下做：列表模式的外层不是滚动容器，scrollIntoView 会连带滚动整页
    if (!isRail || !activeId) return
    const nav = navRef.current
    if (!nav) return
    const link = nav.querySelector<HTMLElement>(`[data-heading-id="${CSS.escape(activeId)}"]`)
    const container = nav.querySelector<HTMLElement>('.toc-scroll-container')
    if (!link || !container) return

    const containerRect = container.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    if (linkRect.top < containerRect.top + 12 || linkRect.bottom > containerRect.bottom - 12) {
      link.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [isRail, activeId])

  // 进度条宽度随轨道宽度自适应：用一个不可见的探针测出等宽字符的实际宽度
  const barRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = barRef.current
    if (!node) return
    const probe = node.querySelector<HTMLElement>('[data-cell-probe]')
    const measure = () => {
      const cellWidth = probe ? probe.getBoundingClientRect().width / PROBE_CELLS : 0
      if (cellWidth > 0) setCells(Math.max(8, Math.floor(node.clientWidth / cellWidth)))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [isRail, items])

  const groups = useMemo(() => {
    const result: Group[] = []
    for (const heading of items) {
      if (heading.level === 2) result.push({ head: heading, subs: [] })
      else if (result.length === 0) result.push({ head: null, subs: [heading] })
      else result[result.length - 1].subs.push(heading)
    }
    return result
  }, [items])

  if (items.length === 0) return null

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const lenis = (window as typeof window & { __lenis?: { scrollTo: (t: Element, opts?: Record<string, unknown>) => void } })
      .__lenis
    if (lenis) lenis.scrollTo(target, { offset: -HEADER_OFFSET })
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, behavior: 'smooth' })
    setActiveId(id)
    history.replaceState(null, '', `#${id}`)
  }

  const renderLink = (heading: Heading, indented: boolean) => {
    const isActive = activeId === heading.id
    return (
      <a
        key={heading.id}
        href={`#${heading.id}`}
        data-heading-id={heading.id}
        onClick={(event) => handleClick(event, heading.id)}
        aria-current={isActive ? 'location' : undefined}
        className={`flex py-[3px] text-[13px] leading-[1.6] transition-colors duration-200 ${
          indented ? 'pl-[18px]' : ''
        } ${isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
        <span className="line-clamp-2 min-w-0">{heading.text}</span>
      </a>
    )
  }

  const list = (
    <div>
      {groups.map((group, index) => {
        // 轨道模式下只展开“当前所在的那一节”的 h3，列表模式全部展开
        const expanded =
          !isRail || !group.head || group.head.id === activeId || group.subs.some((sub) => sub.id === activeId)
        return (
          <div key={group.head?.id ?? `lead-${index}`}>
            {group.head && renderLink(group.head, false)}
            {group.subs.length > 0 && (
              <div
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(.19,1,.22,1)] motion-reduce:transition-none ${
                  expanded ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
                }`}>
                <div className="min-h-0 overflow-hidden">{group.subs.map((sub) => renderLink(sub, !!group.head))}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (!isRail) {
    return (
      <nav ref={navRef} aria-label="文章目录">
        <div className="toc-scroll-container">{list}</div>
      </nav>
    )
  }

  const filled = Math.round((progress / 100) * cells)

  return (
    <nav ref={navRef} aria-label="文章目录" className="flex max-h-[calc(100dvh-8rem)] flex-col">
      {title && (
        <div
          aria-hidden={!titleVisible}
          className={`shrink-0 overflow-hidden font-serif text-base font-semibold leading-snug text-foreground transition-[opacity,transform,max-height,margin] duration-[400ms] ease-[cubic-bezier(.19,1,.22,1)] motion-reduce:transition-none ${
            titleVisible ? 'mb-6 max-h-60 translate-y-0 opacity-100' : 'max-h-0 translate-y-2 opacity-0'
          }`}>
          {title}
        </div>
      )}
      <div className="mb-3 shrink-0 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">目录</div>
      <div className="toc-scroll-container toc-scrollbar min-h-0 overflow-y-auto overscroll-contain pr-2">{list}</div>
      <div
        className="mt-6 flex shrink-0 items-baseline gap-2.5 font-mono text-[12px]"
        role="progressbar"
        aria-label="阅读进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}>
        <span
          ref={barRef}
          aria-hidden="true"
          className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap text-muted-foreground/40">
          <span className="text-accent">{'▓'.repeat(filled)}</span>
          {'░'.repeat(Math.max(0, cells - filled))}
          <span data-cell-probe className="invisible absolute left-0 top-0">
            {'░'.repeat(PROBE_CELLS)}
          </span>
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {String(Math.round(progress)).padStart(2, '0')}%
        </span>
      </div>
    </nav>
  )
}
