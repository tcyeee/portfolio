/**
 * Generate a URL-safe slug from frontmatter fields or a filename.
 * Priority: frontmatter.slug > frontmatter.title > filename (without .md)
 *
 * @param {Record<string, any>} frontmatter
 * @param {string} filename
 * @returns {string}
 */
export function resolveSlug(frontmatter, filename) {
  const base = filename.replace(/\.md$/, '')
  const source = frontmatter.slug || frontmatter.title || base
  return (
    String(source)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '') || base.toLowerCase().replace(/\s+/g, '-')
  )
}
