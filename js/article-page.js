(() => {
    "use strict";

    const root = document.querySelector("[data-article-root]");
    const utils = window.OrianBlog || {};

    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get("slug") || "";
    }

    const formatDate = (value) => utils.formatDate?.(value, {
        year: "numeric",
        month: "long",
        day: "numeric"
    }) ?? value ?? "";

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
            .map((paragraph) => `<p>${utils.escapeHtml?.(paragraph) ?? paragraph}</p>`)
            .join("");

        root.innerHTML = `
            <div class="section-container article-layout">
                <header class="article-header reveal">
                    <p class="article-meta">${formatDate(article.date)}</p>
                    <h1 class="article-page-title">${utils.escapeHtml?.(article.title) ?? article.title}</h1>
                    <p class="article-excerpt">${utils.escapeHtml?.(article.excerpt) ?? article.excerpt}</p>
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
        const article = utils.getArticleBySlug?.(slug) ?? null;

        if (!article) {
            renderNotFound();
            return;
        }

        renderArticle(article);
    }

    init();
})();
