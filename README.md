# Orian's Blog

一个使用原生 HTML、CSS 和 JavaScript 构建的静态博客。

## 文件说明
- `index.html`：首页
- `article.html`：文章详情页
- `css/style.css`：公共样式
- `js/main.js`：动画与交互
- `js/articles-data.js`：所有文章内容
- `js/articles-home.js`：首页文章卡片
- `js/article-page.js`：文章详情页渲染

## 如何新增文章
编辑 `js/articles-data.js`，追加一个对象：

```js
{
    slug: "your-slug",
    title: "文章标题",
    date: "2026-05-02",
    excerpt: "首页显示的简短摘要。",
    content: [
        "第一段内容。",
        "第二段内容。"
    ]
}
```

Rules:
- `slug` 必须唯一
- `date` 使用 `YYYY-MM-DD`
- `content` 中的每个字符串都会变成一个段落

保存后，首页列表和文章详情页会自动更新。

## 更快捷的方式
使用辅助脚本追加文章骨架：

```powershell
.\new-article.ps1 -Title "My New Article"
```

然后再去 `js/articles-data.js` 里补全文字内容。
