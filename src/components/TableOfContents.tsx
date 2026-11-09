import { useEffect, useState } from 'react'
import type { Heading } from '../utils/markdown'

interface Props {
  headings: Heading[]
}

// 固定导航栏高度（对应 Layout 中 main 的 pt-24 顶部内边距），用作“阅读线”的位置
const HEADER_OFFSET = 96

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    let ticking = false

    // 取标题顶部已经越过“阅读线”（紧贴固定导航栏下方）的最后一个标题作为当前阅读位置，
    // 比用 IntersectionObserver 的可见区域判断更直接：无论标题之间间距多大、是否短暂不可见都能命中。
    const updateActive = () => {
      ticking = false
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
    <nav aria-label="文章目录" className="text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-3">目录</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}>
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
  )
}
