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

    let filterTimer = null;

    const formatDate = (value) => utils.formatDate?.(value, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }) ?? value ?? "";

    function getArticles() {
        return utils.getArticles?.() ?? [];
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
        if (getView() === "archive") {
            params.set("from", "articles");
        } else {
            params.set("from", "home");
        }
        return `article.html?${params.toString()}`;
    }

    function renderArticleCard(article, index) {
        return `
            <article class="article-card" style="--card-delay: ${index * CARD_STAGGER_STEP_MS}ms">
                <a class="article-link" href="${getArticleLink(article)}">
                    <p class="article-meta">${formatDate(article.date)} · ${article.views || 0} views</p>
                    <h3 class="article-card-title">${escape(article.title)}</h3>
                    <p class="article-excerpt">${escape(article.excerpt)}</p>
                    <span class="article-cta">Read article</span>
                </a>
            </article>
        `;
    }

    function renderEmptyState(query) {
        const message = query
            ? `No articles found for "${escape(query)}".`
            : "No articles yet.";
        articleList.innerHTML = `<div class="empty-state">${message}</div>`;
    }

    function resolveBaseArticles(articles) {
        if (getView() === "archive") {
            return articles;
        }

        return articles.slice(0, RECENT_LIMIT);
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
            searchStatus.textContent = `${count} result${count === 1 ? "" : "s"}`;
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

    function bindSearch() {
        if (!searchInput) {
            return;
        }

        const onInput = () => {
            renderWithTransition();
        };

        searchInput.addEventListener("input", onInput);
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

        applyRender();
        bindSearch();
        bindSearchToggle();
        bindSort();
        window.addEventListener("pagehide", clearFilterTimer, { once: true });
    }

    init();
})();
