/**
 * 文章列表 / 文章详情用到的一组线性图标（lucide 风格，24x24 stroke 图标）。
 * 直接内联 SVG，避免为几个图标引入额外依赖。
 */
interface IconProps {
  className?: string
}

const strokeProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function CalendarIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

export function FolderIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

export function HashIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}

export function ChevronRightIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function ChevronLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function GithubIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export function XIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function BilibiliIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="M7 3 9.5 6" />
      <path d="M17 3 14.5 6" />
      <rect x="2" y="6" width="20" height="15" rx="4" />
      <path d="M8 11v3" />
      <path d="M16 11v3" />
    </svg>
  )
}

export function BookIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

export function MailIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function SearchIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg {...strokeProps} className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
