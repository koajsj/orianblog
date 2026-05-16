# Orian's Blog

一个基于原生 `HTML + CSS + JavaScript` 的静态博客项目，重点放在文章阅读体验、按钮反馈、页面层级和轻量动效。

## 当前能力

- 首页带有简洁自我介绍、阅读入口、内容标签和最近文章
- 文章列表支持搜索、排序、结果状态反馈和 `/` 快捷聚焦搜索
- 首页和归档页文章卡片展示本地浏览/喜欢统计
- 文章详情页支持阅读进度、目录高亮、点赞、收藏、复制链接和本地评论
- 中英文双语内容切换
- 深浅色主题切换
- SEO 元信息和 `JSON-LD` 文章结构化数据
- 全站轻量滚动显现、悬停反馈和 reduced-motion 回退

## 最近优化

- 首页补充双语简介和内容标签，让首屏不只剩单一 CTA
- 文章卡片补充浏览量与喜欢数，列表信息更容易快速扫描
- 统一部分标题和卡片字距，避免移动端出现过紧的视觉压缩
- 保持纯静态、无构建依赖，所有统计仍只写入本地 `localStorage`

## 项目结构

- `index.html`：首页
- `articles.html`：文章归档页
- `article.html`：文章详情页
- `css/style.css`：全站样式、布局和动画
- `js/articles-data.js`：文章数据源
- `js/blog-utils.js`：文章规范化、日期格式化、统计状态和语言状态
- `js/articles-home.js`：首页/归档页渲染、搜索、排序和文案切换
- `js/article-page.js`：详情页渲染、目录、评论和交互
- `js/main.js`：主题切换、语言切换、全站动效和滚动行为

## 本地运行

这是纯静态项目，直接打开 `index.html` 即可预览。
更推荐使用本地静态服务器，例如 VS Code Live Server，避免本地文件模式下的浏览器差异。

## 新增文章

编辑 `js/articles-data.js`，向 `window.ARTICLES_DATA` 追加对象：

```js
{
  slug: "my-post",
  title: {
    zh: "中文标题",
    en: "English title"
  },
  excerpt: {
    zh: "中文摘要",
    en: "English excerpt"
  },
  content: {
    zh: ["第一段", "## 小节标题", "第二段"],
    en: ["Paragraph one", "## Section title", "Paragraph two"]
  },
  date: "2026-05-10"
}
```

规则：

- `slug` 必须唯一
- `date` 使用 `YYYY-MM-DD`
- `content` 中 `##` 和 `###` 会自动生成目录
- 使用单独一行的 ````` `` 标记代码块开始和结束

## 统计与状态

- 阅读、点赞、收藏保存在 `localStorage` 的 `orian_blog_metrics_v1`
- 语言状态保存在 `orian_blog_lang_v1`
- 评论保存在 `orian_blog_comments_v1`
- 主题保存在 `orian_blog_theme`
