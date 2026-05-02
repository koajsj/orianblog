# Orian's Blog

Static blog built with plain HTML, CSS, and JavaScript.

## Files
- `index.html`: homepage
- `article.html`: article detail page
- `css/style.css`: shared styles
- `js/main.js`: motion and interaction
- `js/articles-data.js`: all article content
- `js/articles-home.js`: homepage article cards
- `js/article-page.js`: article detail rendering

## How to add a new article
Edit `js/articles-data.js` and append one object:

```js
{
    slug: "your-slug",
    title: "Your title",
    date: "2026-05-02",
    excerpt: "Short summary shown on the homepage.",
    content: [
        "First paragraph.",
        "Second paragraph."
    ]
}
```

Rules:
- `slug` must be unique
- `date` should use `YYYY-MM-DD`
- each string inside `content` becomes one paragraph

After saving, the homepage list and article page update automatically.

## Faster option
Use the helper script to append a new article stub:

```powershell
.\new-article.ps1 -Title "My New Article"
```

Then edit the new object inside `js/articles-data.js`.
