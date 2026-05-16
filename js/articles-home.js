(() => {
    "use strict";

    const ARTICLE_LIST_SELECTOR = "[data-articles-list]";
    const SEARCH_INPUT_SELECTOR = "[data-articles-search]";
    const SEARCH_CLEAR_SELECTOR = "[data-articles-clear]";
    const SORT_SELECTOR = "[data-articles-sort]";
    const RECENT_LIMIT = 3;
    const FILTER_TRANSITION_MS = 180;
    const CARD_STAGGER_STEP_MS = 85;

    const utils = window.OrianBlog || {};
    const articleList = document.querySelector(ARTICLE_LIST_SELECTOR);
    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    const searchClear = document.querySelector(SEARCH_CLEAR_SELECTOR);
    const sortSelect = document.querySelector(SORT_SELECTOR);

    const I18N = {
        zh: {
            siteTitle: "Orian's Blog",
            siteDescription: "Orian 的博客。",
            navArticles: "文章",
            homeTitle: "最新",
            archiveTitle: "归档",
            archiveDesc: "全部文章。",
            archiveKicker: "Archive",
            archiveSrTitle: "文章归档",
            allArticles: "全部",
            primaryCta: "文章",
            homeDescription: "记录代码、界面细节和短篇故事，内容尽量克制、清楚、少噪音。",
            signalWriting: "写作",
            signalBilingual: "双语",
            signalLightweight: "轻量",
            viewsLabel: "浏览",
            likesLabel: "喜欢",
            sortLatest: "最新发布",
            sortViews: "最多阅读",
            sortLikes: "最多喜欢",
            searchArchive: "搜索标题、摘要或正文",
            noArticles: "还没有文章。",
            noMatch: "没有找到相关文章。",
            readArticle: "阅读全文",
            articleRankLatest: "最新",
            articleRankPopular: "热门",
            articleRankLiked: "高赞",
            articleRankSaved: "已收藏",
            clear: "清空"
        },
        en: {
            siteTitle: "Orian's Blog",
            siteDescription: "Orian's blog.",
            navArticles: "Articles",
            homeTitle: "Latest",
            archiveTitle: "Archive",
            archiveDesc: "All writing.",
            archiveKicker: "Archive",
            archiveSrTitle: "Article archive",
            allArticles: "All",
            primaryCta: "Articles",
            homeDescription: "Notes on code, interface craft, and small stories, kept concise enough to read without noise.",
            signalWriting: "Writing",
            signalBilingual: "Bilingual",
            signalLightweight: "Lightweight",
            viewsLabel: "views",
            likesLabel: "likes",
            sortLatest: "Latest",
            sortViews: "Most viewed",
            sortLikes: "Most liked",
            searchArchive: "Search title, excerpt, or article body",
            noArticles: "No articles yet.",
            noMatch: "No matching articles.",
            readArticle: "Read article",
            articleRankLatest: "Latest",
            articleRankPopular: "Popular",
            articleRankLiked: "Top liked",
            articleRankSaved: "Saved",
            clear: "Clear"
        }
    };

    let filterTimer = null;

    function getLang() {
        return utils.getLanguage?.() || "en";
    }

    function t(key) {
        const lang = getLang();
        return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function escape(value) {
        return utils.escapeHtml?.(value) ?? String(value ?? "");
    }

    function getArticles() {
        return utils.getArticles?.() ?? [];
    }

    function getView() {
        return articleList?.dataset.articlesView || "recent";
    }

    function getQuery() {
        return searchInput?.value.trim().toLowerCase() || "";
    }

    function clearFilterTimer() {
        if (filterTimer) {
            window.clearTimeout(filterTimer);
            filterTimer = null;
        }
    }

    function formatDate(value) {
        return utils.formatDate?.(value, {
            year: "numeric",
            month: getLang() === "zh" ? "numeric" : "short",
            day: "numeric"
        }) ?? value ?? "";
    }

    function getArticleLink(article) {
        const params = new URLSearchParams({ slug: article.slug });
        params.set("from", getView() === "archive" ? "articles" : "home");
        return `article.html?${params.toString()}`;
    }

    function getRankLabel(article, index) {
        const sortType = sortSelect?.value || "latest";
        if (article.bookmarked) {
            return t("articleRankSaved");
        }
        if (sortType === "likes") {
            return t("articleRankLiked");
        }
        if (sortType === "views") {
            return t("articleRankPopular");
        }
        return index === 0 ? t("articleRankLatest") : `${String(index + 1).padStart(2, "0")}`;
    }

    function renderArticleCard(article, index) {
        return `
            <article class="article-card" style="--card-delay: ${index * CARD_STAGGER_STEP_MS}ms">
                <a class="article-link" href="${getArticleLink(article)}">
                    <div class="article-card-top">
                        <span class="article-chip">${escape(getRankLabel(article, index))}</span>
                        <p class="article-meta">${formatDate(article.date)}</p>
                    </div>
                    <h3 class="article-card-title">${escape(article.title)}</h3>
                    <p class="article-excerpt">${escape(article.excerpt)}</p>
                    <div class="article-card-stats" aria-label="Article stats">
                        <span>${Number(article.views) || 0} ${t("viewsLabel")}</span>
                        <span>${Number(article.likes) || 0} ${t("likesLabel")}</span>
                    </div>
                    <div class="article-card-footer">
                        <span class="article-cta">${t("readArticle")}</span>
                    </div>
                </a>
            </article>
        `;
    }

    function renderEmptyState() {
        if (!articleList) {
            return;
        }

        articleList.innerHTML = `
            <div class="empty-state">
                <strong>${getQuery() ? t("noMatch") : t("noArticles")}</strong>
            </div>
        `;
    }

    function resolveBaseArticles(articles) {
        return getView() === "archive" ? articles : articles.slice(0, RECENT_LIMIT);
    }

    function filterArticles(articles, query) {
        if (!query) {
            return articles;
        }

        return articles.filter((article) => {
            const haystack = [
                article.title,
                article.excerpt,
                article.slug,
                ...(Array.isArray(article.content) ? article.content : [])
            ].join(" ").toLowerCase();
            return haystack.includes(query);
        });
    }

    function sortArticles(articles) {
        const sortType = sortSelect?.value || "latest";
        if (sortType === "views") {
            return [...articles].sort((left, right) => (right.views || 0) - (left.views || 0));
        }
        if (sortType === "likes") {
            return [...articles].sort((left, right) => (right.likes || 0) - (left.likes || 0));
        }
        return articles;
    }

    function updateDocumentMeta(isArchive) {
        document.title = isArchive
            ? `${t("archiveTitle")} | ${t("siteTitle")}`
            : t("siteTitle");

        const description = isArchive ? t("archiveDesc") : t("siteDescription");
        const descriptionNode = document.querySelector('meta[name="description"]');
        if (descriptionNode) {
            descriptionNode.setAttribute("content", description);
        }
    }

    function updateStaticCopy() {
        const isArchive = getView() === "archive";
        const title = document.querySelector(".section-title, .page-title-xl");
        const desc = document.querySelector(".page-copy-tight");
        const archiveKicker = document.querySelector("[data-archive-kicker]");
        const allArticles = document.querySelector(".articles-archive-link");
        const srTitle = document.getElementById("articles-archive-title");
        const navArticles = document.querySelector(".nav-links a[href='articles.html']");
        const primaryCta = document.querySelector("[data-primary-cta]");
        const homeDescription = document.querySelector("[data-home-description]");
        const signalWriting = document.querySelector('[data-home-signal="writing"]');
        const signalBilingual = document.querySelector('[data-home-signal="bilingual"]');
        const signalLightweight = document.querySelector('[data-home-signal="lightweight"]');

        if (sortSelect && sortSelect.options.length >= 3) {
            sortSelect.options[0].text = t("sortLatest");
            sortSelect.options[1].text = t("sortViews");
            sortSelect.options[2].text = t("sortLikes");
        }

        if (searchInput) {
            searchInput.placeholder = t("searchArchive");
            searchInput.setAttribute("aria-label", t("searchArchive"));
        }

        if (searchClear) {
            searchClear.textContent = t("clear");
            searchClear.setAttribute("aria-label", t("clear"));
        }

        if (archiveKicker) {
            archiveKicker.textContent = t("archiveKicker");
        }

        if (title) {
            title.textContent = isArchive ? t("archiveTitle") : t("homeTitle");
        }

        if (desc && isArchive) {
            desc.textContent = t("archiveDesc");
        }

        if (allArticles) {
            allArticles.textContent = t("allArticles");
        }

        if (srTitle) {
            srTitle.textContent = t("archiveSrTitle");
        }

        if (navArticles) {
            navArticles.textContent = t("navArticles");
        }

        if (primaryCta) {
            primaryCta.textContent = t("primaryCta");
        }

        if (homeDescription) {
            homeDescription.textContent = t("homeDescription");
        }

        if (signalWriting) {
            signalWriting.textContent = t("signalWriting");
        }

        if (signalBilingual) {
            signalBilingual.textContent = t("signalBilingual");
        }

        if (signalLightweight) {
            signalLightweight.textContent = t("signalLightweight");
        }

        updateDocumentMeta(isArchive);
    }

    function applyRender() {
        if (!articleList) {
            return;
        }

        const query = getQuery();
        const articles = sortArticles(filterArticles(resolveBaseArticles(getArticles()), query));

        if (articles.length === 0) {
            renderEmptyState();
            return;
        }

        articleList.innerHTML = articles.map((article, index) => renderArticleCard(article, index)).join("");
    }

    function renderWithTransition() {
        if (!articleList) {
            return;
        }

        clearFilterTimer();
        articleList.classList.add("is-filtering");
        filterTimer = window.setTimeout(() => {
            applyRender();
            articleList.classList.remove("is-filtering");
            filterTimer = null;
        }, FILTER_TRANSITION_MS);
    }

    function bindSearch() {
        if (!searchInput) {
            return;
        }

        searchInput.addEventListener("input", renderWithTransition);
        searchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") {
                return;
            }
            searchInput.value = "";
            renderWithTransition();
        });
    }

    function bindSearchClear() {
        if (!searchClear || !searchInput) {
            return;
        }

        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            renderWithTransition();
            searchInput.focus();
        });
    }

    function bindSort() {
        if (!sortSelect) {
            return;
        }

        sortSelect.addEventListener("change", renderWithTransition);
    }

    function init() {
        if (!articleList) {
            return;
        }

        updateStaticCopy();
        applyRender();
        bindSearch();
        bindSearchClear();
        bindSort();
        window.addEventListener("pagehide", clearFilterTimer, { once: true });
    }

    init();
})();
