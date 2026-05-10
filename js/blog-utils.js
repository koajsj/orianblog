(() => {
    "use strict";

    const DEFAULT_LOCALE = {
        zh: "zh-CN",
        en: "en-US"
    };
    const STORAGE_KEY = "orian_blog_metrics_v1";
    const LANGUAGE_KEY = "orian_blog_lang_v1";
    const DEFAULT_VIEW_SEED = [18, 14, 11, 9, 7, 5];
    const formatterCache = new Map();
    const warnedDuplicateSlugs = new Set();
    const warnedInvalidArticles = new Set();
    const utils = window.OrianBlog || {};

    let normalizedArticlesCache = null;
    let normalizedArticlesSource = null;

    function normalizeLanguage(value) {
        return value === "zh" ? "zh" : "en";
    }

    function getLanguage() {
        try {
            const stored = window.localStorage?.getItem(LANGUAGE_KEY) || "";
            if (stored === "zh" || stored === "en") {
                return stored;
            }
        } catch {
            // Ignore storage errors.
        }

        const htmlLang = String(document.documentElement.lang || "").toLowerCase();
        if (htmlLang.startsWith("zh")) {
            return "zh";
        }
        return "en";
    }

    function getLocale() {
        return DEFAULT_LOCALE[getLanguage()] || DEFAULT_LOCALE.en;
    }

    function setLanguage(nextLanguage, options = {}) {
        const lang = normalizeLanguage(nextLanguage);
        if (getLanguage() === lang) {
            return lang;
        }

        try {
            window.localStorage?.setItem(LANGUAGE_KEY, lang);
        } catch {
            // Ignore storage errors.
        }

        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        if (options.notify !== false) {
            window.dispatchEvent(new CustomEvent("orian:languagechange", { detail: { lang } }));
        }
        return lang;
    }

    function syncDocumentLanguage() {
        const lang = getLanguage();
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    }

    function parseDateValue(value) {
        if (typeof value !== "string" || !value) {
            return null;
        }

        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getComparableTitle(article) {
        if (article && article.title && typeof article.title === "object") {
            return String(article.title.en || article.title.zh || "");
        }
        return String(article?.title ?? "");
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

            return getComparableTitle(right).localeCompare(getComparableTitle(left));
        });
    }

    function normalizeLocalizedValue(baseValue, zhValue, enValue) {
        const toText = (value) => String(value ?? "").trim();
        if (baseValue && typeof baseValue === "object") {
            return {
                zh: toText(baseValue.zh || zhValue || ""),
                en: toText(baseValue.en || enValue || "")
            };
        }

        const baseText = toText(baseValue);
        return {
            zh: toText(zhValue || baseText),
            en: toText(enValue || baseText)
        };
    }

    function normalizeLocalizedContent(baseValue, zhValue, enValue) {
        const normalizeArray = (value) => Array.isArray(value)
            ? value.map((paragraph) => String(paragraph ?? "").trim()).filter(Boolean)
            : [];

        if (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)) {
            return {
                zh: normalizeArray(baseValue.zh?.length ? baseValue.zh : zhValue),
                en: normalizeArray(baseValue.en?.length ? baseValue.en : enValue)
            };
        }

        const base = normalizeArray(baseValue);
        const zh = normalizeArray(zhValue);
        const en = normalizeArray(enValue);
        return {
            zh: zh.length > 0 ? zh : base,
            en: en.length > 0 ? en : base
        };
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

        return {
            slug,
            title: normalizeLocalizedValue(article.title, article.title_zh, article.title_en),
            excerpt: normalizeLocalizedValue(article.excerpt, article.excerpt_zh, article.excerpt_en),
            content: normalizeLocalizedContent(article.content, article.content_zh, article.content_en),
            date: typeof article.date === "string" ? article.date : "",
            views: Number.isFinite(Number(article.views)) ? Number(article.views) : 0
        };
    }

    function safeParseJson(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function getStoredMetrics() {
        const parsed = safeParseJson(window.localStorage?.getItem(STORAGE_KEY) || "");
        if (!parsed || typeof parsed !== "object") {
            return {};
        }
        return parsed;
    }

    function setStoredMetrics(metrics) {
        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(metrics));
    }

    function readArticleMetricsFrom(metrics, slug) {
        const current = metrics?.[slug];
        if (!current || typeof current !== "object") {
            return { views: 0, likes: 0, bookmarked: false, viewed: false };
        }

        return {
            views: Number.isFinite(Number(current.views)) ? Number(current.views) : 0,
            likes: Number.isFinite(Number(current.likes)) ? Number(current.likes) : 0,
            bookmarked: Boolean(current.bookmarked),
            viewed: Boolean(current.viewed)
        };
    }

    function readArticleMetrics(slug) {
        return readArticleMetricsFrom(getStoredMetrics(), slug);
    }

    function writeArticleMetrics(slug, nextValues) {
        const metrics = getStoredMetrics();
        metrics[slug] = {
            ...readArticleMetricsFrom(metrics, slug),
            ...nextValues
        };
        setStoredMetrics(metrics);
        return readArticleMetricsFrom(metrics, slug);
    }

    function ensureInitialMetrics(articles) {
        const metrics = getStoredMetrics();
        let changed = false;

        articles.forEach((article, index) => {
            if (metrics[article.slug]) {
                return;
            }

            metrics[article.slug] = {
                views: article.views > 0 ? article.views : DEFAULT_VIEW_SEED[index % DEFAULT_VIEW_SEED.length],
                likes: index === 0 ? 2 : index === 1 ? 1 : 0,
                bookmarked: false,
                viewed: false
            };
            changed = true;
        });

        if (changed) {
            setStoredMetrics(metrics);
        }
    }

    function getNormalizedArticles() {
        if (!Array.isArray(window.ARTICLES_DATA)) {
            normalizedArticlesSource = null;
            normalizedArticlesCache = [];
            return normalizedArticlesCache;
        }

        if (normalizedArticlesSource === window.ARTICLES_DATA && Array.isArray(normalizedArticlesCache)) {
            return normalizedArticlesCache;
        }

        const seenSlugs = new Set();
        normalizedArticlesCache = sortArticlesByDate(
            window.ARTICLES_DATA
                .map((article, index) => normalizeArticle(article, index, seenSlugs))
                .filter(Boolean)
        );
        normalizedArticlesSource = window.ARTICLES_DATA;
        ensureInitialMetrics(normalizedArticlesCache);
        return normalizedArticlesCache;
    }

    function getArticles() {
        const normalized = getNormalizedArticles();
        const language = getLanguage();
        const allMetrics = getStoredMetrics();

        return normalized.map((article) => {
            const stats = readArticleMetricsFrom(allMetrics, article.slug);
            return {
                ...article,
                title: article.title?.[language] || article.title?.en || article.title?.zh || article.slug,
                excerpt: article.excerpt?.[language] || article.excerpt?.en || article.excerpt?.zh || "",
                content: article.content?.[language] || article.content?.en || article.content?.zh || [],
                views: stats.views,
                likes: stats.likes,
                bookmarked: stats.bookmarked
            };
        });
    }

    function getArticleBySlug(slug) {
        return getArticles().find((article) => article.slug === slug) || null;
    }

    function getFeaturedArticle() {
        return getArticles()[0] || null;
    }

    function getSiteStats() {
        const articles = getArticles();
        return articles.reduce((summary, article) => {
            summary.articles += 1;
            summary.views += Number(article.views) || 0;
            summary.likes += Number(article.likes) || 0;
            if (article.bookmarked) {
                summary.bookmarks += 1;
            }
            return summary;
        }, {
            articles: 0,
            views: 0,
            likes: 0,
            bookmarks: 0
        });
    }

    function getArticleStats(slug) {
        return readArticleMetrics(slug);
    }

    function incrementArticleView(slug) {
        const current = readArticleMetrics(slug);
        return writeArticleMetrics(slug, {
            views: current.views + 1,
            viewed: true
        });
    }

    function incrementArticleLike(slug) {
        const current = readArticleMetrics(slug);
        return writeArticleMetrics(slug, { likes: current.likes + 1 });
    }

    function toggleArticleBookmark(slug) {
        const current = readArticleMetrics(slug);
        return writeArticleMetrics(slug, { bookmarked: !current.bookmarked });
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

        return getDateFormatter(getLocale(), options).format(date);
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
                case "\"":
                    return "&quot;";
                case "'":
                    return "&#39;";
                default:
                    return character;
            }
        });
    }

    Object.assign(utils, {
        escapeHtml,
        formatDate,
        getArticleBySlug,
        getArticleStats,
        getArticles,
        getFeaturedArticle,
        getLanguage,
        getLocale,
        getSiteStats,
        incrementArticleLike,
        incrementArticleView,
        setLanguage,
        toggleArticleBookmark
    });

    syncDocumentLanguage();
    window.OrianBlog = utils;
})();
