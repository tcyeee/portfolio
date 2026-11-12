---
name: import-obsidian-note
description: 把一篇 Obsidian 笔记导入本仓库，转成 public/articles/ 或 public/projects/ 下符合本站内容流水线的 Markdown 文件（frontmatter 映射、wikilink/embed 转换、附件搬运），再跑索引生成脚本。触发词："/import-obsidian-note"、"导入笔记"、"把这篇笔记导入项目"、"导入 Obsidian 文章/项目"。
---

# /import-obsidian-note

把一篇 Obsidian 笔记（vault 里的 `.md` 文件）导入本仓库，变成 `public/articles/` 或 `public/projects/` 下的一篇内容，并让它能被 `pnpm generate-article-index` / `pnpm generate-project-index` 正确收录。

## 参数

`/import-obsidian-note <笔记绝对路径> [article|project]`

- 第一个参数必须是 vault 里该笔记 `.md` 文件的绝对路径。相对路径、笔记标题或模糊描述都要停下来问清楚绝对路径，不要自己猜 vault 位置（用户可能有多个 vault）。
- 第二个参数是目标类型。没带就问用户这篇是文章还是项目，不要凭标题或内容猜。

## 流程

1. **读取源笔记**：用 `gray-matter`（或等价方式）拆出 frontmatter 和正文。

2. **定位 vault 根目录**：从笔记路径向上找最近的 `.obsidian` 目录所在层即为 vault 根。读 `.obsidian/app.json` 里的 `attachmentFolderPath`（可能不存在、为空、为 `./` 或某个相对/绝对子目录）作为附件搜索的第一优先位置；找不到再在整个 vault 内按文件名递归搜索（Obsidian 允许附件散落各处，靠文件名唯一定位）。

3. **转换正文语法**（本站用 `marked` 渲染标准 Markdown，不认识 Obsidian 专有语法）：
   - 图片 embed `![[图片.png]]` 或 `![[图片.png|alt文字]]` → 标准 `![alt文字](assets/图片.png)`，并把定位到的实际图片文件复制到目标目录的 `assets/` 子目录（`public/articles/assets/` 或 `public/projects/assets/`，文件已存在且内容不同要改名避免覆盖，比如加短哈希后缀）。
   - 非图片 embed（PDF、其他笔记 `![[另一篇笔记]]`）：本站没有对应渲染能力，直接报告给用户，不要静默丢弃或瞎转换。
   - 普通 wikilink `[[笔记标题]]` 或 `[[笔记标题|别名]]`：本站没有笔记间双向链接功能，统一转成纯文字（取别名，没别名取标题），转换完告诉用户哪些链接被拍平了，方便用户之后手动改成真正的站内链接。
   - Obsidian 的 callout 语法（`> [!note]` 等）、dataview 代码块等本站不支持的专属语法：保留原文但在汇报里提醒用户，不要尝试渲染。

4. **映射 frontmatter**（字段取不到就用默认值，不要编造）：
   - **article**（对应 `scripts/generate-article-index.js` 读取的字段）：`title`（缺省用文件名）、`created`、`category`（自由文本，缺省落到"未分类"）、`tags`（数组）、`banner`（可选图片路径，同样走第 3 步的 assets 搬运逻辑）、`pinned`（布尔，缺省 `false`）。
   - **project**（对应 `scripts/generate-project-index.js` 读取的字段，`category` 必须是 `src/config/index.ts` 的 `ProjectCategory` 枚举之一：`plugin`/`app`/`blockchain`/`mod`/`other`/`wx_mini_program`，源笔记里的值对不上就问用户选哪个，不要硬猜）：`title`、`created`、`category`、`tags`、`banner`、`preview`、`demoUrl`、`downloadUrl`、`githubUrl`、`description`。
   - 源笔记里多出的、本站 schema 不认识的 frontmatter 字段直接丢弃，不要原样塞进去污染输出。

5. **脱敏检查（写入 public/ 之前的强制关卡，不能跳过）**：`public/` 下的内容会被 `pnpm build` 打包，push 到 `prod` 分支后直接对公网发布，所以这一步必须在落盘前完成。扫描对象包括转换后的正文、frontmatter 的每个字段，以及第 3 步定位到、即将搬运的每一张图片（图片靠肉眼检查内容，不只是检查文件名）。至少排查这几类：
   - 可识别的个人信息：手机号、身份证号、具体家庭/公司地址、他人真实姓名、非本人对外邮箱。
   - 凭证与密钥：API key/token/密码、`.env` 内容、内网 IP、数据库连接串、服务器主机名。
   - 第三方隐私：提到朋友/同事/客户的私事、未公开的合作细节、聊天记录内容。
   - 商业敏感信息：薪资、合同条款、未公开的产品代号或内部项目名。
   - 笔记整体性质：哪怕没命中具体敏感词，如果整篇读起来更像私人日记/情绪记录/未完成草稿而非适合公开发布的内容，也要整体判断并提出来。

   命中后**不要自作主张地静默删除、替换或改写**——把每一条命中内容连同上下文（原文片段 + 大致位置/所在段落）列给用户，让用户逐条确认处理方式：删除、替换为占位符（如 `[REDACTED]` 或更贴合上下文的匿名化表达）、或保留。拿到用户针对这篇笔记的确认后才能进入下一步；在此之前不允许把原始内容写入 `public/` 下的任何文件（含图片）。即使用户在发起导入时就说过"这篇没敏感内容，直接导"，扫描仍要跑一遍——这句话是在没看到具体命中结果前说的，真有命中还是要停下来让用户确认，但如果扫描干净就不用再反复确认打扰用户。
   处理时如果删除/替换会让句子读起来断裂，要顺手把前后文改通顺，不要留下语法破碎的空洞或悬空标点。

6. **落盘**：目标文件名 = 笔记文件名（即 slug，URL 里直接用这个文件名去掉 `.md`）。文件名若包含 URL 不安全字符（空格本身没问题，其它站内示例文件名也带空格，但要检查有没有 `/`、`#`、`?` 等真正会破坏 URL 的字符），发现了要停下来问用户想用什么 slug，不要自动改写。写入 `public/articles/<文件名>.md` 或 `public/projects/<文件名>.md`。

7. **重建索引**：跑对应的 `pnpm generate-article-index` 或 `pnpm generate-project-index`，确认命令成功、新条目出现在生成的 JSON 里。

8. **汇报**：列出——导入到了哪个文件、搬运了几张图片、有几个 wikilink 被拍平成纯文字、有没有不支持的语法被原样保留、frontmatter 里哪些字段用了缺省值、脱敏检查命中了什么以及最终各自怎么处理的。方便用户回头手动修一遍。

## 边界情况

- 笔记里引用的图片在 vault 内找不到（附件丢失、改过名）：跳过该图片转换，保留原始 `![[...]]` 写法，在汇报里明确点出来，不要生成一个指向不存在文件的 `assets/` 路径。
- 目标目录下已存在同名文件：先问用户是覆盖还是改个 slug，不要默认覆盖用户已有的内容。
- 用户要求批量导入一个文件夹：对每篇笔记重复 1-7 步（含第 5 步脱敏检查，每篇笔记内容不同，不能只做一次就套用到全部），索引生成脚本在最后统一跑一次即可，不用每篇都重建索引。
