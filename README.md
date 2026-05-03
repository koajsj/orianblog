# Orian's Blog

一个基于原生 `HTML + CSS + JavaScript` 的静态个人博客站点。

## 功能概览
- 首页与文章归档页（`Home / Articles`）
- 文章搜索与排序（最新 / 阅读量 / 点赞）
- 文章详情页阅读进度条
- 阅读量、点赞、收藏（本地存储）
- 深色 / 浅色模式切换（太阳/月亮按钮）
- 顶栏实时时间（`HH:mm`）
- 评论功能（本地存储）
- 代码块复制与轻量语法高亮
- 文章目录 TOC（识别 `##` / `###`）
- 上一篇 / 下一篇导航
- 预计阅读时长（`x min read`）
- 动态 SEO（`description`、`og:*`、`twitter:*`、`JSON-LD`）
- 统一的滚动与悬浮动画风格（桌面与移动端）

## 项目结构
- `index.html`：首页
- `articles.html`：文章列表页
- `article.html`：文章详情页
- `css/style.css`：全站样式与动画
- `js/main.js`：全站交互（主题、时钟、滚动动效等）
- `js/articles-data.js`：文章数据源
- `js/blog-utils.js`：数据规范化、排序、指标存储工具
- `js/articles-home.js`：文章列表渲染、搜索、排序
- `js/article-page.js`：文章详情渲染与交互（TOC、评论、SEO等）
- `new-article.ps1`：新增文章脚本

## 本地运行
这是纯静态项目，直接打开 `index.html` 即可预览。  
建议使用本地静态服务器以获得更稳定体验（例如 VS Code Live Server）。

## 新增文章
编辑 `js/articles-data.js`，追加一个对象：

```js
{
    slug: "your-slug",
    title: "Your Article Title",
    date: "2026-05-02",
    excerpt: "Short summary for cards and SEO description.",
    content: [
        "Paragraph 1...",
        "## Section heading",
        "Paragraph 2...",
        "```",
        "const hello = 'world';",
        "```"
    ]
}
```

规则：
- `slug` 必须唯一
- `date` 使用 `YYYY-MM-DD`
- `content` 每个字符串会渲染为一个段落；`##` / `###` 会生成目录标题；`` ``` `` 包裹代码块

## 快速新增文章（脚本）
```powershell
.\new-article.ps1 -Title "My New Article"
```

生成骨架后，再到 `js/articles-data.js` 补全内容。
