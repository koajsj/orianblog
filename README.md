# Orian's Blog

一个基于原生 `HTML + CSS + JavaScript` 的静态博客网站。

## 功能
- 首页与文章归档页（Home / Articles）
- 搜索与排序（最新 / 阅读量 / 点赞）
- 阅读进度条、阅读时间、上一篇/下一篇
- 点赞、收藏、阅读量统计（`localStorage`）
- 评论功能（`localStorage`）
- 深浅色模式切换（太阳/月亮）
- 中英切换（全站文案与文章内容）
- 顶栏实时时间（`HH:mm`）
- TOC 目录（识别 `##` / `###`）
- 代码块复制与轻量高亮
- 动态 SEO（`description`、`og:*`、`twitter:*`、`JSON-LD`）

## 项目结构
- `index.html`：首页
- `articles.html`：文章列表页
- `article.html`：文章详情页
- `css/style.css`：样式与动画
- `js/main.js`：全站交互（主题、时钟、语言开关等）
- `js/articles-data.js`：文章数据
- `js/blog-utils.js`：数据规范化、指标存储、语言状态
- `js/articles-home.js`：列表渲染、搜索、排序
- `js/article-page.js`：详情页渲染与交互
- `new-article.ps1`：新增文章脚本

## 本地运行
这是纯静态项目，直接打开 `index.html` 即可。  
建议用本地静态服务器（如 VS Code Live Server）预览。

## 新增文章
编辑 `js/articles-data.js`，向 `window.ARTICLES_DATA` 追加对象：

```js
{
  slug: "my-post",
  title: "My Post",
  date: "2026-05-03",
  excerpt: "Short summary...",
  content: [
    "Paragraph 1",
    "## Section",
    "Paragraph 2",
    "```",
    "const a = 1;",
    "```"
  ]
}
```

规则：
- `slug` 必须唯一
- `date` 使用 `YYYY-MM-DD`
- `content` 数组每项渲染为一段；`##` / `###` 生成目录；`` ``` `` 包裹代码块

## 双语文章格式（推荐）
可用中英双语字段：

```js
{
  slug: "motion-notes",
  title: { zh: "为什么动效要保持克制", en: "Why the motion stays light" },
  excerpt: { zh: "中文摘要", en: "English excerpt" },
  content: {
    zh: ["中文段落1", "中文段落2"],
    en: ["English paragraph 1", "English paragraph 2"]
  },
  date: "2026-05-02"
}
```

站点会根据当前语言自动读取对应内容。

## 快速新增文章（脚本）
```powershell
.\new-article.ps1 -Title "My New Article"
```
