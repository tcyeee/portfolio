import typography from '@tailwindcss/typography';

/**
 * 语义色令牌：实际色值在 src/styles/global.css 的 `:root` / `.dark` 中以
 * "R G B" 三元组形式定义，这里统一包一层 rgb(... / <alpha-value>)，
 * 这样 `bg-card`、`border-border/50`、`text-muted-foreground` 这类带透明度
 * 的写法都能正常工作。
 */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef6f2',
          100: '#fce8df',
          200: '#f8d1bf',
          300: '#f3b091',
          400: '#ee8e62',
          500: '#e96a2f',
          600: '#c85b28',
          700: '#a54b21',
          800: '#893e1c',
          900: '#6f3216',
        },
        // 文章列表 / 文章详情使用的语义色
        background: token('background'),
        surface: token('surface'),
        card: token('card'),
        border: token('border'),
        foreground: token('foreground'),
        muted: token('muted'),
        'muted-foreground': token('muted-foreground'),
        'content-secondary': token('content-secondary'),
        secondary: token('secondary'),
        'secondary-foreground': token('secondary-foreground'),
        accent: token('accent'),
        'accent-foreground': token('accent-foreground'),
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    typography,
  ],
}
