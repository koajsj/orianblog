(() => {
    "use strict";

    const ARTICLE_LIST_SELECTOR = "[data-articles-list]";
    const SEARCH_INPUT_SELECTOR = "[data-articles-search]";
    const SEARCH_STATUS_SELECTOR = "[data-articles-search-status]";
    const SEARCH_TOGGLE_SELECTOR = "[data-articles-search-toggle]";
    const SEARCH_SHELL_SELECTOR = "[data-articles-search-shell]";
    const SORT_SELECTOR = "[data-articles-sort]";
    const RECENT_LIMIT = 3;
    const FILTER_TRANSITION_MS = 220;
    const CARD_STAGGER_STEP_MS = 85;

    const articleList = document.querySelector(ARTICLE_LIST_SELECTOR);
    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    const searchStatus = document.querySelector(SEARCH_STATUS_SELECTOR);
    const searchToggle = document.querySelector(SEARCH_TOGGLE_SELECTOR);
    const searchShell = document.querySelector(SEARCH_SHELL_SELECTOR);
    const sortSelect = document.querySelector(SORT_SELECTOR);
    const utils = window.OrianBlog || {};

    const I18N = {
        en: {
            views: "views",
            readArticle: "Read article",
            noArticles: "No articles yet.",
            noMatch: 'No articles found for "{query}".',
            result: "result",
            results: "results",
            sortLatest: "Latest",
            sortViews: "Most viewed",
            sortLikes: "Most liked",
            homeTitle: "Latest writing.",
            homeKicker: "ARTICLES",
            allArticles: "All articles",
            searchRecent: "Search recent writing",
            searchRecentAria: "Search recent articles",
            archiveTitle: "Articles",
            archiveDesc: "All writing in one place.",
            searchArchive: "Search articles",
            archiveSrTitle: "Article archive",
            back: "Back",
            navArticles: "Articles",
            helloLabel: "Hello I'm Orian.",
            helloLine1: "Hello",
            helloLine2: "I'm <span class=\"fw-bold\">Orian.</span>"
        },
        zh: {
            views: "阅读",
            readArticle: "阅读文章",
            noArticles: "暂无文章。",
            noMatch: '未找到与“{query}”相关的文章。',
            result: "条结果",
            results: "条结果",
            sortLatest: "最新",
            sortViews: "阅读最多",
            sortLikes: "点赞最多",
            homeTitle: "最新文章",
            homeKicker: "文章",
            allArticles: "全部文章",
            searchRecent: "搜索最近文章",
            searchRecentAria: "搜索最近文章",
            archiveTitle: "文章",
            archiveDesc: "所有文章汇总。",
            searchArchive: "搜索文章",
            archiveSrTitle: "文章归档",
            back: "返回",
            navArticles: "文章",
            helloLabel: "你好，我是 Orian。",
            helloLine1: "你好",
            helloLine2: "我是 <span class=\"fw-bold\">Orian。</span>"
        }
    };

    let filterTimer = null;

    const formatDate = (value) => utils.formatDate?.(value, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }) ?? value ?? "";

    function getArticles() {
        return utils.getArticles?.() ?? [];
    }

    function getLang() {
        return utils.getLanguage?.() || "en";
    }

    function t(key) {
        const lang = getLang();
        return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function clearFilterTimer() {
        if (filterTimer) {
            window.clearTimeout(filterTimer);
            filterTimer = null;
        }
    }

    function getView() {
        return articleList?.dataset.articlesView || "recent";
    }

    function getQuery() {
        return searchInput?.value.trim().toLowerCase() || "";
    }

    function escape(value) {
        return utils.escapeHtml?.(value) ?? String(value ?? "");
    }

    function getArticleLink(article) {
        const params = new URLSearchParams({ slug: article.slug });
        params.set("from", getView() === "archive" ? "articles" : "home");
        return `article.html?${params.toString()}`;
    }

    function renderArticleCard(article, index) {
        return `
            <article class="article-card" style="--card-delay: ${index * CARD_STAGGER_STEP_MS}ms">
                <a class="article-link" href="${getArticleLink(article)}">
                    <p class="article-meta">${formatDate(article.date)} · ${article.views || 0} ${t("views")}</p>
                    <h3 class="article-card-title">${escape(article.title)}</h3>
                    <p class="article-excerpt">${escape(article.excerpt)}</p>
                    <span class="article-cta">${t("readArticle")}</span>
                </a>
            </article>
        `;
    }

    function renderEmptyState(query) {
        const message = query
            ? t("noMatch").replace("{query}", escape(query))
            : t("noArticles");
        articleList.innerHTML = `<div class="empty-state">${message}</div>`;
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
            searchStatus.textContent = getLang() === "zh"
                ? `${count}${t("results")}`
                : `${count} ${count === 1 ? t("result") : t("results")}`;
            return;
        }

        if (getLang() === "zh") {
            searchStatus.textContent = `${count}${getView() === "archive" ? "篇文章" : "篇最新"}`;
            return;
        }

        const label = getView() === "archive" ? "article" : "latest";
        searchStatus.textContent = `${count} ${label}${count === 1 ? "" : "s"}`;
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

        if (articles.length === 0) {
            renderEmptyState(query);
            return;
        }

        articleList.innerHTML = articles
            .map((article, index) => renderArticleCard(article, index))
            .join("");
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

    function updateStaticCopy() {
        const isArchive = getView() === "archive";
        const sort = document.querySelector(SORT_SELECTOR);
        const search = document.querySelector(SEARCH_INPUT_SELECTOR);
        const backText = document.querySelector(".nav-back-btn");
        const title = document.querySelector(".section-title, .page-title-xl");
        const kicker = document.querySelector(".section-kicker-strong");
        const desc = document.querySelector(".page-copy-tight");
        const allArticles = document.querySelector(".articles-archive-link");
        const srTitle = document.getElementById("articles-archive-title");
        const navArticles = document.querySelector(".nav-links a[href='articles.html']");
        const heroLabel = document.querySelector(".hero-title");
        const heroLine1 = document.querySelector(".hero-line:nth-child(1) .hero-line-inner");
        const heroLine2 = document.querySelector(".hero-line:nth-child(2) .hero-line-inner");

        if (sort && sort.options.length >= 3) {
            sort.options[0].text = t("sortLatest");
            sort.options[1].text = t("sortViews");
            sort.options[2].text = t("sortLikes");
        }
        if (search) {
            search.placeholder = isArchive ? t("searchArchive") : t("searchRecent");
        }
        if (searchToggle) {
            searchToggle.setAttribute("aria-label", t("searchRecentAria"));
        }
        if (backText && backText.childNodes.length > 0) {
            backText.childNodes[backText.childNodes.length - 1].nodeValue = ` ${t("back")}`;
        }
        if (kicker && !isArchive) {
            kicker.textContent = t("homeKicker");
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
            heroLabel.setAttribute("aria-label", t("helloLabel"));
            heroLine1.textContent = t("helloLine1");
            heroLine2.innerHTML = t("helloLine2");
        }
    }

    function bindSearch() {
        if (!searchInput) {
            return;
        }
        searchInput.addEventListener("input", renderWithTransition);
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
                if (document.activeElement === searchToggle || document.activeElement === searchInput) {
                    return;
                }
                if (!searchInput.value.trim()) {
                    setSearchShellOpen(false);
                }
            }, 0);
        };

        const onSearchKeydown = (event) => {
            if (event.key !== "Escape") {
                return;
            }

            searchInput.value = "";
            renderWithTransition();
            setSearchShellOpen(false);
            searchToggle.focus();
        };

        searchToggle.addEventListener("click", onToggleClick);
        searchInput.addEventListener("blur", onSearchBlur);
        searchInput.addEventListener("keydown", onSearchKeydown);
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
        bindSearchToggle();
        bindSort();
        window.addEventListener("orian:languagechange", () => {
            updateStaticCopy();
            applyRender();
        });
        window.addEventListener("pagehide", clearFilterTimer, { once: true });
    }

    init();
})();
