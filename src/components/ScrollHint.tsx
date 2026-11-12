import { useState } from 'react'

// How long the falling-icons dismiss animation (see FallingIcons.tsx) takes to
// finish, so the auto-scroll only starts once the hero is visually clear.
const ICON_DISMISS_MS = 450

interface LenisLike {
  scrollTo: (target: string | HTMLElement, opts?: Record<string, unknown>) => void
}

export default function ScrollHint() {
  const [dismissed, setDismissed] = useState(false)

  function handleClick() {
    if (dismissed) return
    setDismissed(true)

    window.dispatchEvent(new CustomEvent('hero-dismiss-icons'))

    // `#obsidian-reveal` (when present) sits between the hero and
    // `#second-screen` — jumping straight to `#second-screen` would skip its
    // whole scroll-driven animation. Not looked up via `nextElementSibling`:
    // Astro wraps hydrated components in `<astro-island>` (itself
    // `display: contents`, so its getBoundingClientRect is always zero-size)
    // and can inject a bootstrap `<script>` as a sibling ahead of it, so
    // DOM-order traversal lands on the wrong node.
    const nextScreen = document.getElementById('obsidian-reveal') ?? document.getElementById('second-screen')
    if (!nextScreen) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollToNextScreen = () => {
      const lenis = (window as typeof window & { __lenis?: LenisLike }).__lenis
      if (lenis) {
        lenis.scrollTo(nextScreen)
      } else {
        nextScreen.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }
    }

    if (prefersReducedMotion) {
      scrollToNextScreen()
    } else {
      window.setTimeout(scrollToNextScreen, ICON_DISMISS_MS)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="向下滚动到下一屏"
      className={`text-gray-400 transition-opacity duration-300 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 ${
        dismissed ? 'pointer-events-none opacity-0' : 'animate-bounce opacity-100'
      }`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}
