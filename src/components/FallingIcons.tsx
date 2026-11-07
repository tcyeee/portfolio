import { useEffect, useRef } from 'react'

const ICONS = [
  { name: 'obsidian', color: '#7C3AED' },
  { name: 'raycast', color: '#FF6363' },
  { name: 'minecraft', color: '#62B47A' },
  { name: 'typescript', color: '#3178C6' },
  { name: 'java', color: '#F89820' },
  { name: 'kotlin', color: '#7F52FF' },
  { name: 'flutter', color: '#02569B' },
  { name: 'rust', color: '#2B2B2B' },
  { name: 'solana', color: '#9945FF' },
  { name: 'claude', color: '#D97757' },
  { name: 'deepseek', color: '#5786FE' },
  { name: 'astro', color: '#BC52EE' },
  { name: 'react', color: '#61DAFB' },
  { name: 'tailwind', color: '#06B6D4' },
  { name: 'dart', color: '#0175C2' },
  { name: 'tauri', color: '#24C8D8' },
  { name: 'ethereum', color: '#3C3C3D' },
]

const TILE_R = 38.4
const GAP = 8
// Keep the falling area from touching the left/right edges of the hero screen.
const WALL_GAP = 20
const GRAVITY = 1800
const FLOOR_RESTITUTION = 0.32
const WALL_RESTITUTION = 0.5
const FLOOR_FRICTION = 0.88
const SETTLE_SPEED = 12
const MAX_DT = 1 / 30
// Keep the settled pile from touching the very bottom edge of the hero screen.
const FLOOR_GAP = 10
// Padding kept clear around the email badge so tiles don't visually touch it.
const OBSTACLE_MARGIN = 12
// The hero section's own background (see Hero.astro) — tiles are blended onto
// it so they read as opaque instead of see-through. Mirrors the light/dark bg there.
const LIGHT_PAGE_BG = { r: 249, g: 246, b: 240 }
const DARK_PAGE_BG = { r: 17, g: 24, b: 39 }

function getPageBg() {
  return document.documentElement.classList.contains('dark') ? DARK_PAGE_BG : LIGHT_PAGE_BG
}
// Scroll-reactivity: a sudden change in Lenis scroll velocity (start/stop/direction
// change) jolts the settled pile, like cargo shifting on a truck bed. Using the
// delta (not raw velocity) means steady scrolling doesn't keep pumping in energy.
const SCROLL_KICK = 22
const MAX_SCROLL_IMPULSE = 900

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return { r, g, b }
}

function blendOntoPage(fg: { r: number; g: number; b: number }, alpha: number, pageBg: { r: number; g: number; b: number }) {
  return {
    r: Math.round(fg.r * alpha + pageBg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + pageBg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + pageBg.b * (1 - alpha)),
  }
}

interface Body {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rgb: { r: number; g: number; b: number }
  el: HTMLDivElement
}

interface ObstacleRect {
  left: number
  top: number
  right: number
  bottom: number
}

export default function FallingIcons() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.clientWidth
    let height = container.clientHeight

    const pageBg = getPageBg()

    const bodies: Body[] = ICONS.map(({ name, color }, i) => {
      const r = TILE_R
      const size = r * 2
      const rgb = hexToRgb(color)
      const bg = blendOntoPage(rgb, 0.16, pageBg)
      const border = blendOntoPage(rgb, 0.4, pageBg)

      const tile = document.createElement('div')
      tile.style.position = 'absolute'
      tile.style.width = `${size}px`
      tile.style.height = `${size}px`
      tile.style.borderRadius = `${size * 0.26}px`
      tile.style.background = `rgb(${bg.r}, ${bg.g}, ${bg.b})`
      tile.style.border = `1px solid rgb(${border.r}, ${border.g}, ${border.b})`
      tile.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'
      tile.style.display = 'flex'
      tile.style.alignItems = 'center'
      tile.style.justifyContent = 'center'
      tile.style.willChange = 'transform'

      const icon = document.createElement('img')
      icon.src = `/icons/falling/${name}.svg`
      icon.alt = name
      icon.style.width = '60%'
      icon.style.height = '60%'
      tile.appendChild(icon)

      container.appendChild(tile)

      return {
        x: Math.random() * Math.max(width - size - WALL_GAP * 2, size) + r + WALL_GAP,
        y: -size - i * 90 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 60,
        vy: 0,
        r,
        rgb,
        el: tile,
      }
    })

    // Re-blend tile colors when the theme toggles at runtime (ThemeToggle only
    // flips the `dark` class, no reload), so tiles keep reading as opaque.
    function applyThemeColors() {
      const bg = getPageBg()
      for (const body of bodies) {
        const fill = blendOntoPage(body.rgb, 0.16, bg)
        const border = blendOntoPage(body.rgb, 0.4, bg)
        body.el.style.background = `rgb(${fill.r}, ${fill.g}, ${fill.b})`
        body.el.style.border = `1px solid rgb(${border.r}, ${border.g}, ${border.b})`
      }
    }
    const themeObserver = new MutationObserver(applyThemeColors)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    let rafId: number
    let lastTime = performance.now()
    let floorY = height - FLOOR_GAP
    let obstacle: ObstacleRect | null = null
    let lastScrollVelocity = 0

    function resize() {
      if (!container) return
      width = container.clientWidth
      height = container.clientHeight
      floorY = height - FLOOR_GAP
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    // The email badge (bottom-right) lives outside this component, so its
    // size/position is re-measured every frame — it's a single cheap rect
    // read, and its width changes continuously from the typing animation.
    function updateObstacle() {
      const badge = document.getElementById('email-badge')
      if (!badge || !container) {
        obstacle = null
        return
      }
      const containerRect = container.getBoundingClientRect()
      const badgeRect = badge.getBoundingClientRect()
      obstacle = {
        left: badgeRect.left - containerRect.left - OBSTACLE_MARGIN,
        top: badgeRect.top - containerRect.top - OBSTACLE_MARGIN,
        right: badgeRect.right - containerRect.left + OBSTACLE_MARGIN,
        bottom: badgeRect.bottom - containerRect.top + OBSTACLE_MARGIN,
      }
    }

    function step(now: number) {
      const dt = Math.min((now - lastTime) / 1000, MAX_DT)
      lastTime = now

      updateObstacle()

      // Scroll-reactive jolt: react to the *change* in scroll speed (start/stop/
      // direction change) rather than raw speed, so steady scrolling doesn't keep
      // pumping energy into the pile — reuses the Lenis instance the site already
      // runs for smooth scroll, instead of pulling in a separate physics/scroll library.
      const lenis = (window as typeof window & { __lenis?: { velocity: number } }).__lenis
      const scrollVelocity = lenis?.velocity ?? 0
      const scrollDelta = scrollVelocity - lastScrollVelocity
      lastScrollVelocity = scrollVelocity
      if (Math.abs(scrollDelta) > 0.05) {
        const kick = Math.max(-MAX_SCROLL_IMPULSE, Math.min(MAX_SCROLL_IMPULSE, scrollDelta * SCROLL_KICK))
        for (const body of bodies) {
          body.vy -= kick * (0.6 + Math.random() * 0.4)
          body.vx += (Math.random() - 0.5) * Math.abs(kick) * 0.3
        }
      }

      for (const body of bodies) {
        body.vy += GRAVITY * dt
        body.vx *= 0.985
        body.x += body.vx * dt
        body.y += body.vy * dt

        if (body.x - body.r < WALL_GAP) {
          body.x = body.r + WALL_GAP
          body.vx = -body.vx * WALL_RESTITUTION
        } else if (body.x + body.r > width - WALL_GAP) {
          body.x = width - body.r - WALL_GAP
          body.vx = -body.vx * WALL_RESTITUTION
        }

        if (body.y + body.r > floorY) {
          body.y = floorY - body.r
          body.vy = Math.abs(body.vy) > SETTLE_SPEED ? -body.vy * FLOOR_RESTITUTION : 0
          body.vx *= FLOOR_FRICTION
        }

        if (obstacle) {
          const overlapX = Math.min(body.x + body.r, obstacle.right) - Math.max(body.x - body.r, obstacle.left)
          const overlapY = Math.min(body.y + body.r, obstacle.bottom) - Math.max(body.y - body.r, obstacle.top)

          if (overlapX > 0 && overlapY > 0) {
            const obstacleCx = (obstacle.left + obstacle.right) / 2
            const obstacleCy = (obstacle.top + obstacle.bottom) / 2
            const dx = body.x - obstacleCx
            const dy = body.y - obstacleCy

            if (overlapX < overlapY) {
              body.x += overlapX * Math.sign(dx || 1)
              body.vx = -body.vx * WALL_RESTITUTION
            } else {
              body.y += overlapY * Math.sign(dy || -1)
              if (dy < 0) {
                // Resting on top of the badge — treat like a floor.
                body.vy = Math.abs(body.vy) > SETTLE_SPEED ? -body.vy * FLOOR_RESTITUTION : 0
                body.vx *= FLOOR_FRICTION
              } else {
                body.vy = -body.vy * WALL_RESTITUTION
              }
            }
          }
        }
      }

      // Square (AABB) separation: tiles are axis-aligned, so push apart along
      // whichever axis has the smaller overlap rather than treating them as circles.
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i]
          const b = bodies[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const overlapX = a.r + b.r + GAP - Math.abs(dx)
          const overlapY = a.r + b.r + GAP - Math.abs(dy)

          if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
              const push = (overlapX / 2) * Math.sign(dx || 1)
              a.x -= push
              b.x += push
              if ((b.vx - a.vx) * Math.sign(dx || 1) < 0) {
                const avg = (a.vx + b.vx) / 2
                a.vx = avg
                b.vx = avg
              }
            } else {
              const push = (overlapY / 2) * Math.sign(dy || 1)
              a.y -= push
              b.y += push
              if ((b.vy - a.vy) * Math.sign(dy || 1) < 0) {
                const avg = (a.vy + b.vy) / 2
                a.vy = avg
                b.vy = avg
              }

              // Boxes can balance in a perfectly stable tower, unlike circles.
              // Nudge them apart sideways so they topple and spread along the floor instead.
              const lean = (Math.abs(dx) < 1 ? (i % 2 === 0 ? 1 : -1) : Math.sign(dx)) * 14
              a.vx -= lean
              b.vx += lean
            }
          }
        }
      }

      for (const body of bodies) {
        if (body.x - body.r < WALL_GAP) body.x = body.r + WALL_GAP
        else if (body.x + body.r > width - WALL_GAP) body.x = width - body.r - WALL_GAP
        if (body.y + body.r > floorY) body.y = floorY - body.r

        body.el.style.transform = `translate(${body.x - body.r}px, ${body.y - body.r}px)`
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      for (const body of bodies) body.el.remove()
    }
  }, [])

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
}
