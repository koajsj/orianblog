(() => {
    "use strict";

    const ARTICLE_LIST_SELECTOR = "[data-articles-list]";
    const articleList = document.querySelector(ARTICLE_LIST_SELECTOR);
    const RECENT_LIMIT = 3;

    function getArticles() {
        return Array.isArray(window.ARTICLES_DATA) ? window.ARTICLES_DATA : [];
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
            month: "short",
            day: "numeric"
        }).format(date);
    }

    function renderArticleCard(article) {
        return `
            <article class="article-card">
                <a class="article-link" href="article.html?slug=${encodeURIComponent(article.slug)}">
                    <p class="article-meta">${formatDate(article.date)}</p>
                    <h3 class="article-card-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <span class="article-cta">Read article</span>
                </a>
            </article>
        `;
    }

    function renderEmptyState() {
        articleList.innerHTML = '<div class="empty-state">No articles yet.</div>';
    }

    function resolveArticles(articles) {
        const view = articleList?.dataset.articlesView || "recent";
        if (view === "archive") {
            return articles;
        }

        return articles.slice(0, RECENT_LIMIT);
    }

    function renderArticles() {
        if (!articleList) {
            return;
        }

        const articles = getArticles();
        if (articles.length === 0) {
            renderEmptyState();
            return;
        }

        articleList.innerHTML = resolveArticles(articles).map(renderArticleCard).join("");
    }

    renderArticles();
})();
