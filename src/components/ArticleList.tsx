import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Article } from '../domain'
import {
  BilibiliIcon,
  BookIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  GithubIcon,
  HashIcon,
  MailIcon,
  XIcon,
} from './icons'

export interface CategoryCount {
  name: string
  count: number
}

export interface SocialLink {
  label: string
  href: string
  icon: 'github' | 'x' | 'bilibili' | 'rednote' | 'mail'
}

interface Props {
  title?: string
  articles: Article[]
  categories: CategoryCount[]
  tags: string[]
  pageSize?: number
  profile: {
    name: string
    avatar: string
    motto: string
    status: string
    links: SocialLink[]
  }
}

/** 分类列表折叠时展示的条目数（不含「全部」） */
const COLLAPSED_CATEGORY_COUNT = 5
/** 标签列表折叠时展示的条目数 */
const COLLAPSED_TAG_COUNT = 15

const ALL = '全部'

const socialIcons = {
  github: GithubIcon,
  x: XIcon,
  bilibili: BilibiliIcon,
  rednote: BookIcon,
  mail: MailIcon,
}

/** 把 frontmatter 里的时间（如 `2025-06-17 13:25`）统一格式化为 `YYYY-MM-DD` */
function formatDate(raw: string): string {
  if (!raw) return ''
  const matched = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(raw.trim())
  if (matched) {
    const [, y, m, d] = matched
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`
}

/** 侧栏卡片标题：左侧一道竖红条 + 标题文字 */
function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-accent rounded-full" />
      <h2 className="font-medium text-foreground">{children}</h2>
    </div>
  )
}

export default function ArticleList({ title = '全部文章', articles, categories, tags, pageSize = 10, profile }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [activeTag, setActiveTag] = useState<string>('')
  const [page, setPage] = useState(1)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)

  // 首次挂载时从 URL 查询参数恢复筛选状态，使 `?category=`/`?tag=` 链接可以直接分享
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    const tag = params.get('tag')
    if (category) setActiveCategory(category)
    if (tag) setActiveTag(tag)
  }, [])

  // 筛选条件变化时同步回地址栏（replaceState，不污染前进/后退历史）
  const syncUrl = useCallback((category: string, tag: string) => {
    const params = new URLSearchParams(window.location.search)
    if (category && category !== ALL) params.set('category', category)
    else params.delete('category')
    if (tag) params.set('tag', tag)
    else params.delete('tag')
    const query = params.toString()
    history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }, [])

  const selectCategory = (name: string) => {
    const next = activeCategory === name ? ALL : name
    setActiveCategory(next)
    setPage(1)
    syncUrl(next, activeTag)
  }

  const selectTag = (name: string) => {
    const next = activeTag === name ? '' : name
    setActiveTag(next)
    setPage(1)
    syncUrl(activeCategory, next)
  }

  const filtered = useMemo(
    () =>
      articles.filter((article) => {
        if (activeCategory !== ALL && article.category !== activeCategory) return false
        if (activeTag && !(article.tags || []).includes(activeTag)) return false
        return true
      }),
    [articles, activeCategory, activeTag]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages))
    document.getElementById('article-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const shownCategories = categoriesExpanded ? categories : categories.slice(0, COLLAPSED_CATEGORY_COUNT)
  const shownTags = tagsExpanded ? tags : tags.slice(0, COLLAPSED_TAG_COUNT)

  return (
    <section id="article-list" className="article-list-root min-h-screen px-6 py-16 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 onload-animation" style={{ '--content-delay': '50ms' } as React.CSSProperties}>
          <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.625rem]">
            {title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧栏：名片 / 分类 / 标签 */}
          <div className="order-2 lg:order-1 onload-animation" style={{ '--content-delay': '100ms' } as React.CSSProperties}>
            <aside className="w-full lg:w-72 shrink-0 space-y-8">
              <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-accent/20">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">{profile.name}</h2>
                <div className="w-8 h-0.5 bg-accent mx-auto mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{profile.motto}</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {profile.links.map((link) => {
                    const Icon = socialIcons[link.icon]
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={link.label}
                        className="p-2 rounded-full bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Icon />
                      </a>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {profile.status}
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-5">
                <CardHeading>分类</CardHeading>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => selectCategory(ALL)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === ALL
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}>
                    <span>{ALL}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        activeCategory === ALL ? 'bg-accent text-accent-foreground' : 'bg-secondary'
                      }`}>
                      {articles.length}
                    </span>
                  </button>
                  {shownCategories.map((category) => {
                    const isActive = activeCategory === category.name
                    return (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => selectCategory(category.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}>
                        <span className="truncate">{category.name}</span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${
                            isActive ? 'bg-accent text-accent-foreground' : 'bg-secondary'
                          }`}>
                          {category.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {categories.length > COLLAPSED_CATEGORY_COUNT && (
                  <button
                    type="button"
                    onClick={() => setCategoriesExpanded((value) => !value)}
                    className="w-full mt-3 text-sm text-accent hover:text-accent/80 transition-colors flex items-center justify-center gap-2">
                    <span className="tracking-widest text-accent/70">•••</span>
                    {categoriesExpanded ? '收起' : '更多'}
                  </button>
                )}
              </div>

              {tags.length > 0 && (
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <CardHeading>标签</CardHeading>
                  <div className="flex flex-wrap gap-2">
                    {shownTags.map((tag) => {
                      const isActive = activeTag === tag
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => selectTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}>
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  {tags.length > COLLAPSED_TAG_COUNT && (
                    <button
                      type="button"
                      onClick={() => setTagsExpanded((value) => !value)}
                      className="w-full mt-3 text-sm text-accent hover:text-accent/80 transition-colors flex items-center justify-center gap-2">
                      <span className="tracking-widest text-accent/70">•••</span>
                      {tagsExpanded ? '收起' : '更多'}
                    </button>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* 右侧：文章卡片列表 */}
          <div className="order-1 lg:order-2 flex-1 space-y-4">
            {visible.map((article, index) => (
              <ArticleCard
                key={article.slug}
                article={article}
                delay={index * 50}
                activeCategory={activeCategory}
                activeTag={activeTag}
                onSelectCategory={selectCategory}
                onSelectTag={selectTag}
              />
            ))}

            {visible.length === 0 && (
              <div className="bg-card border border-border/50 rounded-xl p-12 text-center text-muted-foreground">
                没有找到匹配的文章
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="分页" className="flex w-full justify-center pt-6">
                <ul className="flex flex-row items-center gap-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50">
                      <ChevronLeftIcon />
                      <span className="hidden sm:block">上一页</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <li key={number}>
                      <button
                        type="button"
                        onClick={() => goToPage(number)}
                        aria-current={number === currentPage ? 'page' : undefined}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          number === currentPage
                            ? 'border border-border bg-card text-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}>
                        {number}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50">
                      <span className="hidden sm:block">下一页</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

interface CardProps {
  article: Article
  delay: number
  activeCategory: string
  activeTag: string
  onSelectCategory: (name: string) => void
  onSelectTag: (name: string) => void
}

function ArticleCard({ article, delay, activeCategory, activeTag, onSelectCategory, onSelectTag }: CardProps) {
  const href = `/article/${encodeURIComponent(article.slug)}`
  const tags = article.tags || []

  // 整张卡片可点击，但分类/标签这类内部按钮需要阻止冒泡，否则会误跳转
  const open = () => {
    window.location.href = href
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`阅读：${article.title}`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className="group relative bg-card border border-border/50 rounded-xl p-5 cursor-pointer onload-animation"
      style={{ '--content-delay': `${delay}ms` } as React.CSSProperties}>
      {article.pinned && (
        <span className="absolute top-4 right-4 text-[11px] font-medium tracking-wide text-muted-foreground/80">置顶</span>
      )}
      <div className="flex gap-4 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-[19px] font-semibold text-foreground mb-3 leading-[1.4] transition-colors duration-75 flex items-start gap-2">
            <span className="w-1 h-6 shrink-0 bg-accent rounded-full" />
            <a href={href} className="flex-1 min-w-0 hover:text-accent transition-colors duration-75">
              {article.title}
            </a>
            {article.banner && (
              <span className="sm:hidden block w-20 h-14 shrink-0 rounded-lg overflow-hidden">
                <img src={article.banner} alt="" loading="lazy" className="w-full h-full object-cover" />
              </span>
            )}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground mb-3">
            {article.created && (
              <span className="flex items-center gap-1.5">
                <CalendarIcon />
                {formatDate(article.created)}
              </span>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelectCategory(article.category)
              }}
              className={`inline-flex items-center gap-1.5 hover:text-accent transition-colors ${
                activeCategory === article.category ? 'text-accent' : ''
              }`}>
              <FolderIcon />
              {article.category}
            </button>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectTag(tag)
                  }}
                  className={`inline-flex items-center gap-1.5 hover:text-accent transition-colors ${
                    activeTag === tag ? 'text-accent' : ''
                  }`}>
                  <HashIcon />
                  {tag}
                </button>
              ))
            ) : (
              <span className="flex items-center gap-1.5">
                <HashIcon />
                未标签
              </span>
            )}
          </div>

          {article.content && (
            <p className="text-content-secondary text-sm leading-relaxed mb-3 line-clamp-2">{article.content}</p>
          )}

          <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <span>{article.wordCount} 字</span>
            <span className="text-border">|</span>
            <span>{article.readingMinutes} 分钟</span>
          </div>
        </div>

        {article.banner && (
          <div className="hidden sm:block w-28 h-20 shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.banner}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="hidden sm:flex items-center shrink-0 text-muted-foreground opacity-0 group-hover:text-accent group-hover:opacity-100 transition-[color,opacity] duration-200">
          <ChevronRightIcon />
        </div>
      </div>
    </article>
  )
}
