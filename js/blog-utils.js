(() => {
    "use strict";

    const DEFAULT_LOCALE = "en-US";
    const formatterCache = new Map();
    const utils = window.OrianBlog || {};

    function getArticles() {
        return Array.isArray(window.ARTICLES_DATA) ? window.ARTICLES_DATA : [];
    }

    function getDateFormatter(locale, options) {
        const cacheKey = `${locale}|${JSON.stringify(options)}`;
        if (!formatterCache.has(cacheKey)) {
            formatterCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
        }

        return formatterCache.get(cacheKey);
    }

    function formatDate(value, options = {}) {
        if (!value) {
            return "";
        }

        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return getDateFormatter(DEFAULT_LOCALE, options).format(date);
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
            switch (character) {
                case "&":
                    return "&amp;";
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case '"':
                    return "&quot;";
                case "'":
                    return "&#39;";
                default:
                    return character;
            }
        });
    }

    function getArticleBySlug(slug) {
        return getArticles().find((article) => article.slug === slug) || null;
    }

    Object.assign(utils, {
        escapeHtml,
        formatDate,
        getArticleBySlug,
        getArticles
    });

    window.OrianBlog = utils;
})();
