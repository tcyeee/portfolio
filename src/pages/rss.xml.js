import rss from '@astrojs/rss'
import { articles, personalInfo } from '../config'

export function GET(context) {
  return rss({
    title: `${personalInfo.name} 的文章`,
    description: personalInfo.bio,
    site: context.site,
    items: articles.map((article) => ({
      title: article.title,
      description: article.content,
      link: `/article/${article.slug}`,
      ...(article.created && !isNaN(new Date(article.created).getTime()) ? { pubDate: new Date(article.created) } : {}),
    })),
    customData: `<language>zh-CN</language>`,
  })
}
