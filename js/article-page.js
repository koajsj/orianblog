(() => {
    "use strict";

    const root = document.querySelector("[data-article-root]");

    function getArticles() {
        return Array.isArray(window.ARTICLES_DATA) ? window.ARTICLES_DATA : [];
    }

    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get("slug") || "";
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("en", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }).format(date);
    }

    function renderNotFound() {
        document.title = "Article not found | Orian's Blog";
        root.innerHTML = `
            <div class="section-container article-layout">
                <div class="empty-state">This article does not exist.</div>
            </div>
        `;
    }

    function renderArticle(article) {
        document.title = `${article.title} | Orian's Blog`;
        const content = article.content
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join("");

        root.innerHTML = `
            <div class="section-container article-layout">
                <header class="article-header reveal">
                    <p class="article-meta">${formatDate(article.date)}</p>
                    <h1 class="article-page-title">${article.title}</h1>
                    <p class="article-excerpt">${article.excerpt}</p>
                </header>
                <article class="article-body reveal">
                    ${content}
                </article>
            </div>
        `;
    }

    function init() {
        if (!root) {
            return;
        }

        const slug = getSlug();
        const article = getArticles().find((entry) => entry.slug === slug);

        if (!article) {
            renderNotFound();
            return;
        }

        renderArticle(article);
    }

    init();
})();
