(() => {
    "use strict";

    const ARTICLE_LIST_SELECTOR = "[data-articles-list]";
    const SEARCH_INPUT_SELECTOR = "[data-articles-search]";
    const SEARCH_STATUS_SELECTOR = "[data-articles-search-status]";
    const SEARCH_TOGGLE_SELECTOR = "[data-articles-search-toggle]";
    const SEARCH_SHELL_SELECTOR = "[data-articles-search-shell]";
    const SEARCH_CLEAR_SELECTOR = "[data-articles-clear]";
    const SORT_SELECTOR = "[data-articles-sort]";
    const FILTER_HINT_SELECTOR = "[data-articles-filter-hint]";
    const RECENT_LIMIT = 3;
    const FILTER_TRANSITION_MS = 200;
    const CARD_STAGGER_STEP_MS = 85;

    const utils = window.OrianBlog || {};
    const articleList = document.querySelector(ARTICLE_LIST_SELECTOR);
    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    const searchStatus = document.querySelector(SEARCH_STATUS_SELECTOR);
    const searchToggle = document.querySelector(SEARCH_TOGGLE_SELECTOR);
    const searchShell = document.querySelector(SEARCH_SHELL_SELECTOR);
    const searchClear = document.querySelector(SEARCH_CLEAR_SELECTOR);
    const sortSelect = document.querySelector(SORT_SELECTOR);
    const filterHint = document.querySelector(FILTER_HINT_SELECTOR);
    const featuredShell = document.querySelector("[data-featured-article-shell]");
    const footerNote = document.querySelector("[data-footer-note]");

    const I18N = {
        zh: {
            siteTitle: "Orian's Blog",
            siteDescription: "记录前端、界面和轻量交互，把页面写得更有节奏，也更能真正使用。",
            heroKicker: "Frontend / Motion / Notes",
            heroLabel: "把界面写得更有呼吸感",
            heroLine1: "把界面",
            heroLine2: "写得更有 <span class=\"fw-bold\">呼吸感</span>",
            primaryCta: "查看全部文章",
            secondaryCta: "浏览最新更新",
            signal1: "双语内容",
            signal2: "轻量动效",
            signal3: "真实交互",
            navArticles: "文章",
            footer: "一个持续迭代中的静态博客实验。",
            views: "阅读",
            likes: "喜欢",
            savedCount: "收藏",
            readArticle: "阅读全文",
            noArticles: "还没有可展示的文章。",
            noMatch: "没有找到与“{query}”相关的文章。",
            noMatchHint: "试试标题关键词、摘要里的短语，或者正文中的概念词。",
            result: "条结果",
            results: "条结果",
            latestShown: "已显示 {count} 篇最新文章",
            archiveShown: "共 {count} 篇文章",
            sortLatest: "最新发布",
            sortViews: "最多阅读",
            sortLikes: "最多喜欢",
            homeTitle: "最新写作",
            homeKicker: "最新文章",
            allArticles: "全部文章",
            searchRecent: "搜索最近更新",
            searchRecentAria: "搜索最近文章",
            searchArchive: "搜索文章标题、摘要或正文",
            searchHint: "可搜索标题、摘要、slug 和正文内容",
            archiveTitle: "文章归档",
            archiveDesc: "按主题、表达方式或正文关键词筛选全部写作。",
            archiveSrTitle: "文章归档列表",
            archiveKicker: "Archive",
            back: "返回",
            featuredKicker: "精选文章",
            featuredTitle: "当前推荐",
            featuredDescription: "从最近的更新里先读一篇，快速了解这个站点的写作方向。",
            spotlightMeta: "最近更新",
            statArticles: "文章",
            statViews: "累计阅读",
            statLikes: "累计喜欢",
            statBookmarks: "已收藏",
            articleRankLatest: "最新",
            articleRankPopular: "热门",
            articleRankLiked: "高赞",
            articleRankSaved: "已收藏",
            clear: "清空"
        },
        en: {
            siteTitle: "Orian's Blog",
            siteDescription: "Notes on frontend craft, interface density, and lighter interactions that still feel deliberate.",
            heroKicker: "Frontend / Motion / Notes",
            heroLabel: "Writing interfaces with more breathing room",
            heroLine1: "Writing interfaces",
            heroLine2: "with more <span class=\"fw-bold\">breathing room</span>",
            primaryCta: "Browse all articles",
            secondaryCta: "See latest updates",
            signal1: "Bilingual notes",
            signal2: "Light motion",
            signal3: "Sharper interaction",
            navArticles: "Articles",
            footer: "An evolving static blog focused on interface craft.",
            views: "views",
            likes: "likes",
            savedCount: "saved",
            readArticle: "Read article",
            noArticles: "No articles yet.",
            noMatch: 'No articles found for "{query}".',
            noMatchHint: "Try a title keyword, a phrase from the excerpt, or a concept from the article body.",
            result: "result",
            results: "results",
            latestShown: "{count} latest articles shown",
            archiveShown: "{count} articles in total",
            sortLatest: "Latest",
            sortViews: "Most viewed",
            sortLikes: "Most liked",
            homeTitle: "Latest writing",
            homeKicker: "Latest Articles",
            allArticles: "All articles",
            searchRecent: "Search latest writing",
            searchRecentAria: "Search recent articles",
            searchArchive: "Search title, excerpt, or article body",
            searchHint: "Search title, excerpt, slug, and article content",
            archiveTitle: "Article archive",
            archiveDesc: "Filter the full writing archive by topic, phrasing, or body content.",
            archiveSrTitle: "Article archive",
            archiveKicker: "Archive",
            back: "Back",
            featuredKicker: "Featured",
            featuredTitle: "Read this first",
            featuredDescription: "Start with the newest update to understand the tone and direction of the site.",
            spotlightMeta: "Latest update",
            statArticles: "articles",
            statViews: "total views",
            statLikes: "total likes",
            statBookmarks: "saved",
            articleRankLatest: "Latest",
            articleRankPopular: "Popular",
            articleRankLiked: "Top liked",
            articleRankSaved: "Saved",
            clear: "Clear"
        }
    };

    let filterTimer = null;

    function getLang() {
        return utils.getLanguage?.() || "zh";
    }

    function t(key) {
        const lang = getLang();
        return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function escape(value) {
        return utils.escapeHtml?.(value) ?? String(value ?? "");
    }

    function formatDate(value) {
        return utils.formatDate?.(value, {
            year: "numeric",
            month: getLang() === "zh" ? "numeric" : "short",
            day: "numeric"
        }) ?? value ?? "";
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
                    <div class="article-card-footer">
                        <div class="article-card-stats">
                            <span>${article.views || 0} ${t("views")}</span>
                            <span>${article.likes || 0} ${t("likes")}</span>
                        </div>
                        <span class="article-cta">${t("readArticle")}</span>
                    </div>
                </a>
            </article>
        `;
    }

    function renderEmptyState(query) {
        if (!articleList) {
            return;
        }

        const safeQuery = escape(query);
        const message = query
            ? t("noMatch").replace("{query}", safeQuery)
            : t("noArticles");

        articleList.innerHTML = `
            <div class="empty-state">
                <strong>${message}</strong>
                <p>${t("noMatchHint")}</p>
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

    function updateSearchStatus(count, query) {
        if (!searchStatus) {
            return;
        }

        if (query) {
            if (getLang() === "zh") {
                searchStatus.textContent = `${count}${t("results")}`;
            } else {
                searchStatus.textContent = `${count} ${count === 1 ? t("result") : t("results")}`;
            }
            return;
        }

        const template = getView() === "archive" ? t("archiveShown") : t("latestShown");
        searchStatus.textContent = template.replace("{count}", String(count));
    }

    function updateSearchUiState() {
        const hasQuery = Boolean(searchInput?.value.trim());
        if (searchClear) {
            searchClear.hidden = !hasQuery;
        }
    }

    function setSearchShellOpen(isOpen) {
        if (!searchShell || !searchToggle) {
            return;
        }
        searchShell.classList.toggle("is-open", isOpen);
        searchToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    function applyRender() {
        if (!articleList) {
            return;
        }

        const query = getQuery();
        const articles = sortArticles(filterArticles(resolveBaseArticles(getArticles()), query));
        updateSearchStatus(articles.length, query);
        updateSearchUiState();

        if (articles.length === 0) {
            renderEmptyState(query);
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
        const sort = sortSelect;
        const search = searchInput;
        const title = document.querySelector(".section-title, .page-title-xl");
        const kicker = document.querySelector(".section-kicker-strong");
        const desc = document.querySelector(".page-copy-tight");
        const archiveKicker = document.querySelector("[data-archive-kicker]");
        const allArticles = document.querySelector(".articles-archive-link");
        const srTitle = document.getElementById("articles-archive-title");
        const navArticles = document.querySelector(".nav-links a[href='articles.html']");
        const heroLabel = document.querySelector(".hero-title");
        const heroLine1 = document.querySelector(".hero-line:nth-child(1) .hero-line-inner");
        const heroLine2 = document.querySelector(".hero-line:nth-child(2) .hero-line-inner");
        const heroKicker = document.querySelector("[data-hero-kicker]");
        const heroDescription = document.querySelector("[data-site-description]");
        const primaryCta = document.querySelector("[data-primary-cta]");
        const secondaryCta = document.querySelector("[data-secondary-cta]");
        const signalNodes = document.querySelectorAll("[data-hero-signal]");
        const featuredTitle = document.querySelector("[data-featured-title]");
        const featuredDesc = document.querySelector("[data-featured-description]");

        if (sort && sort.options.length >= 3) {
            sort.options[0].text = t("sortLatest");
            sort.options[1].text = t("sortViews");
            sort.options[2].text = t("sortLikes");
        }
        if (search) {
            search.placeholder = isArchive ? t("searchArchive") : t("searchRecent");
            search.setAttribute("aria-label", isArchive ? t("searchArchive") : t("searchRecent"));
        }
        if (searchToggle) {
            searchToggle.setAttribute("aria-label", t("searchRecentAria"));
        }
        if (searchClear) {
            searchClear.textContent = t("clear");
            searchClear.setAttribute("aria-label", t("clear"));
        }
        if (kicker && !isArchive) {
            kicker.textContent = t("homeKicker");
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
        if (heroLabel && heroLine1 && heroLine2 && !isArchive) {
            heroLabel.setAttribute("aria-label", t("heroLabel"));
            heroLine1.textContent = t("heroLine1");
            heroLine2.innerHTML = t("heroLine2");
        }
        if (heroKicker) {
            heroKicker.textContent = t("heroKicker");
        }
        if (heroDescription) {
            heroDescription.textContent = t("siteDescription");
        }
        if (primaryCta) {
            primaryCta.textContent = t("primaryCta");
        }
        if (secondaryCta) {
            secondaryCta.textContent = t("secondaryCta");
        }
        if (signalNodes.length >= 3) {
            signalNodes[0].textContent = t("signal1");
            signalNodes[1].textContent = t("signal2");
            signalNodes[2].textContent = t("signal3");
        }
        if (featuredTitle) {
            featuredTitle.textContent = t("featuredTitle");
        }
        if (featuredDesc) {
            featuredDesc.textContent = t("featuredDescription");
        }
        if (filterHint) {
            filterHint.textContent = t("searchHint");
        }
        if (footerNote) {
            footerNote.textContent = t("footer");
        }

        updateDocumentMeta(isArchive);
    }

    function renderFeaturedArticle() {
        if (!featuredShell) {
            return;
        }

        const featured = utils.getFeaturedArticle?.();
        if (!featured) {
            featuredShell.innerHTML = "";
            return;
        }

        featuredShell.innerHTML = `
            <div class="spotlight-card">
                <div class="spotlight-head">
                    <span class="article-chip">${t("featuredKicker")}</span>
                    <p class="spotlight-meta">${t("spotlightMeta")} · ${formatDate(featured.date)}</p>
                </div>
                <h2 class="spotlight-title">${escape(featured.title)}</h2>
                <p class="spotlight-excerpt">${escape(featured.excerpt)}</p>
                <div class="spotlight-stats">
                    <span>${featured.views || 0} ${t("views")}</span>
                    <span>${featured.likes || 0} ${t("likes")}</span>
                </div>
                <a class="button button-primary spotlight-link" href="${getArticleLink(featured)}">${t("readArticle")}</a>
            </div>
        `;
    }

    function renderSiteStats() {
        const stats = utils.getSiteStats?.() || {};
        const labels = {
            articles: t("statArticles"),
            views: t("statViews"),
            likes: t("statLikes"),
            bookmarks: t("statBookmarks")
        };

        document.querySelectorAll("[data-site-stat]").forEach((node) => {
            const key = node.getAttribute("data-site-stat");
            const valueNode = node.querySelector("[data-site-stat-value]");
            const labelNode = node.querySelector("[data-site-stat-label]");
            if (valueNode) {
                valueNode.textContent = String(stats[key] ?? 0);
            }
            if (labelNode) {
                labelNode.textContent = labels[key] || key || "";
            }
        });
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
            if (searchShell && getView() !== "archive") {
                setSearchShellOpen(false);
                searchToggle?.focus();
            }
        });
    }

    function bindSearchToggle() {
        if (!searchToggle || !searchShell || !searchInput || getView() === "archive") {
            return;
        }

        setSearchShellOpen(false);

        const onToggleClick = () => {
            const nextOpenState = !searchShell.classList.contains("is-open");
            setSearchShellOpen(nextOpenState);
            if (nextOpenState) {
                searchInput.focus();
                return;
            }
            if (!searchInput.value.trim()) {
                renderWithTransition();
            }
        };

        const onSearchBlur = () => {
            window.setTimeout(() => {
                if (document.activeElement === searchToggle || document.activeElement === searchInput || document.activeElement === searchClear) {
                    return;
                }
                if (!searchInput.value.trim()) {
                    setSearchShellOpen(false);
                }
            }, 0);
        };

        searchToggle.addEventListener("click", onToggleClick);
        searchInput.addEventListener("blur", onSearchBlur);
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

    function bindKeyboardShortcuts() {
        if (!searchInput) {
            return;
        }

        document.addEventListener("keydown", (event) => {
            const isTyping = /^(input|textarea|select)$/i.test(document.activeElement?.tagName || "");
            if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping) {
                event.preventDefault();
                if (searchShell && getView() !== "archive") {
                    setSearchShellOpen(true);
                }
                searchInput.focus();
            }
        });
    }

    function init() {
        if (!articleList) {
            return;
        }

        updateStaticCopy();
        renderFeaturedArticle();
        renderSiteStats();
        applyRender();
        bindSearch();
        bindSearchToggle();
        bindSearchClear();
        bindSort();
        bindKeyboardShortcuts();
        window.addEventListener("pagehide", clearFilterTimer, { once: true });
    }

    init();
})();
