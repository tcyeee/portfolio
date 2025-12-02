import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import katex from "katex";

// 配置 marked
marked.use(gfmHeadingId());
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// 配置 marked 选项和自定义渲染器
marked.use({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // 支持换行
  renderer: {
    // 重写代码块渲染，支持数学公式
    code(token) {
      const text = token.text;
      const lang = (token.lang || "").trim();

      // 如果是数学公式（以 math 开头）
      if (lang === "math" || lang.startsWith("math:")) {
        try {
          const displayMode =
            lang.includes("display") || lang.includes("block");
          return katex.renderToString(text, {
            throwOnError: false,
            displayMode: displayMode,
          });
        } catch (e) {
          return `<pre><code>${text}</code></pre>`;
        }
      }

      // 对于其他代码，返回 false 让 marked-highlight 处理
      return false;
    },
  },
  hooks: {
    // 后处理 HTML，处理行内数学公式
    postprocess(html: string) {
      // 处理行内数学公式 $...$（不在代码块中）
      // 先保护代码块中的内容
      const codeBlockRegex = /<pre><code[^>]*>[\s\S]*?<\/code><\/pre>/g;
      const codeBlocks: string[] = [];
      let protectedHtml = html.replace(codeBlockRegex, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
      });

      // 处理行内数学公式
      const mathRegex = /\$([^$\n]+)\$/g;
      protectedHtml = protectedHtml.replace(mathRegex, (match, formula) => {
        try {
          return katex.renderToString(formula, {
            throwOnError: false,
            displayMode: false,
          });
        } catch (e) {
          return match;
        }
      });

      // 恢复代码块
      codeBlocks.forEach((block, index) => {
        protectedHtml = protectedHtml.replace(`__CODE_BLOCK_${index}__`, block);
      });

      return protectedHtml;
    },
  },
});

/**
 * 处理数学公式块（$$...$$）转换为代码块格式
 */
export function processMathBlocks(content: string): string {
  const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
  return content.replace(blockMathRegex, (match, formula) => {
    try {
      return `\n\`\`\`math:display\n${formula.trim()}\n\`\`\`\n`;
    } catch (e) {
      return match;
    }
  });
}

/**
 * 渲染 Markdown 内容为 HTML
 */
export async function renderMarkdown(content: string): Promise<string> {
  const processedContent = processMathBlocks(content);
  return await marked(processedContent);
}

