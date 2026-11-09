import { useEffect, useRef, useState } from 'react'
import type { Heading } from '../utils/markdown'

interface Props {
  headings: Heading[]
}

// 固定导航栏高度（对应 Layout 中 main 的 pt-24 顶部内边距），用作“阅读线”的位置
const HEADER_OFFSET = 96

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState('')
  const [progress, setProgress] = useState(0)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null)

    let ticking = false

    // 取标题顶部已经越过“阅读线”（紧贴固定导航栏下方）的最后一个标题作为当前阅读位置，
    // 比用 IntersectionObserver 的可见区域判断更直接：无论标题之间间距多大、是否短暂不可见都能命中。
    const updateActive = () => {
      ticking = false

      if (elements.length > 0) {
        let current = elements[0].id
        for (const el of elements) {
          if (el.getBoundingClientRect().top - HEADER_OFFSET <= 1) {
            current = el.id
          } else {
            break
          }
        }
        setActiveId(current)
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(updateActive)
    }

    updateActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])

  // 阅读位置变化时，把当前标题滚动到目录可视区域的中间（居中显示）
  useEffect(() => {
    if (!activeId) return
    const nav = navRef.current
    if (!nav) return

    const items = nav.querySelectorAll<HTMLElement>('[data-heading-id]')
    let active: HTMLElement | null = null
    for (const item of items) {
      if (item.dataset.headingId === activeId) {
        active = item
        break
      }
    }
    if (!active) return

    const navRect = nav.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    // 让当前标题的中心对齐到目录可视区域的中心
    const targetTop =
      activeRect.top - navRect.top + nav.scrollTop - (navRect.height - activeRect.height) / 2
    const maxScroll = nav.scrollHeight - nav.clientHeight
    nav.scrollTo({ top: Math.max(0, Math.min(maxScroll, targetTop)), behavior: 'smooth' })
  }, [activeId])

  if (headings.length === 0) return null

  const minLevel = Math.min(...headings.map((h) => h.level))

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    const lenis = (window as typeof window & { __lenis?: { scrollTo: (t: Element, opts?: Record<string, unknown>) => void } })
      .__lenis
    if (lenis) {
      lenis.scrollTo(target, { offset: -96 })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <nav ref={navRef} aria-label="文章目录" className="text-sm overflow-y-auto min-h-0">
        <p className="font-semibold text-gray-900 dark:text-white mb-3">目录</p>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} data-heading-id={heading.id} style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block border-l-2 pl-3 py-0.5 transition-colors ${
                  activeId === heading.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}>
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <div
          className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
          role="progressbar"
          aria-label="阅读进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}>
          <div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
