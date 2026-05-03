(() => {
    "use strict";

    const DEFAULT_LOCALE = "en-US";
    const formatterCache = new Map();
    const utils = window.OrianBlog || {};
    const warnedDuplicateSlugs = new Set();
    const warnedInvalidArticles = new Set();

    function parseDateValue(value) {
        if (typeof value !== "string" || !value) {
            return null;
        }

        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function sortArticlesByDate(articles) {
        return [...articles].sort((left, right) => {
            const leftDate = parseDateValue(left.date);
            const rightDate = parseDateValue(right.date);

            if (leftDate && rightDate) {
                return rightDate.getTime() - leftDate.getTime();
            }

            if (leftDate) {
                return -1;
            }

            if (rightDate) {
                return 1;
            }

            return String(right.title ?? "").localeCompare(String(left.title ?? ""));
        });
    }

    function normalizeArticle(article, index, seenSlugs) {
        if (!article || typeof article !== "object") {
            if (!warnedInvalidArticles.has(index)) {
                console.warn(`Skipping invalid article at index ${index}.`);
                warnedInvalidArticles.add(index);
            }
            return null;
        }

        const slug = typeof article.slug === "string" ? article.slug.trim() : "";
        if (!slug) {
            if (!warnedInvalidArticles.has(index)) {
                console.warn(`Skipping article at index ${index} because it is missing a slug.`);
                warnedInvalidArticles.add(index);
            }
            return null;
        }

        if (seenSlugs.has(slug)) {
            if (!warnedDuplicateSlugs.has(slug)) {
                console.warn(`Skipping duplicate article slug "${slug}".`);
                warnedDuplicateSlugs.add(slug);
            }
            return null;
        }

        seenSlugs.add(slug);

        const content = Array.isArray(article.content)
            ? article.content
                .map((paragraph) => String(paragraph ?? "").trim())
                .filter(Boolean)
            : [];

        return {
            slug,
            title: String(article.title ?? slug),
            date: typeof article.date === "string" ? article.date : "",
            excerpt: String(article.excerpt ?? ""),
            content
        };
    }

    function getArticles() {
        if (!Array.isArray(window.ARTICLES_DATA)) {
            return [];
        }

        const seenSlugs = new Set();
        const normalized = window.ARTICLES_DATA
            .map((article, index) => normalizeArticle(article, index, seenSlugs))
            .filter(Boolean);

        return sortArticlesByDate(normalized);
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

        const date = parseDateValue(value);
        if (!date) {
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
