(() => {
    "use strict";

    const ARTICLE_LIST_SELECTOR = "[data-articles-list]";
    const articleList = document.querySelector(ARTICLE_LIST_SELECTOR);
    const RECENT_LIMIT = 3;
    const utils = window.OrianBlog || {};

    const formatDate = (value) => utils.formatDate?.(value, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }) ?? value ?? "";

    function renderArticleCard(article) {
        return `
            <article class="article-card">
                <a class="article-link" href="article.html?slug=${encodeURIComponent(article.slug)}">
                    <p class="article-meta">${formatDate(article.date)}</p>
                    <h3 class="article-card-title">${utils.escapeHtml?.(article.title) ?? article.title}</h3>
                    <p class="article-excerpt">${utils.escapeHtml?.(article.excerpt) ?? article.excerpt}</p>
                    <span class="article-cta">Read article</span>
                </a>
            </article>
        `;
    }

    function renderEmptyState() {
        articleList.innerHTML = '<div class="empty-state">No articles yet.</div>';
    }

    function resolveArticles(articles) {
        if (articleList?.dataset.articlesView === "archive") {
            return articles;
        }

        return articles.slice(0, RECENT_LIMIT);
    }

    function renderArticles() {
        if (!articleList) {
            return;
        }

        const articles = utils.getArticles?.() ?? [];
        if (articles.length === 0) {
            renderEmptyState();
            return;
        }

        articleList.innerHTML = resolveArticles(articles).map(renderArticleCard).join("");
    }

    renderArticles();
})();
