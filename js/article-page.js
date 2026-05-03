(() => {
    "use strict";

    const root = document.querySelector("[data-article-root]");
    const backButton = document.querySelector("[data-article-back]");
    const progressBar = document.querySelector("[data-reading-progress-bar]");
    const utils = window.OrianBlog || {};
    const scrollListenerOptions = { passive: true };
    let progressCleanup = null;

    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get("slug") || "";
    }

    function getSource() {
        const params = new URLSearchParams(window.location.search);
        return params.get("from") || "";
    }

    const formatDate = (value) => utils.formatDate?.(value, {
        year: "numeric",
        month: "long",
        day: "numeric"
    }) ?? value ?? "";

    function renderNotFound() {
        document.title = "Article not found | Orian's Blog";
        if (progressBar) {
            progressBar.style.transform = "scaleX(0)";
        }
        root.innerHTML = `
            <div class="section-container article-layout">
                <div class="empty-state">This article does not exist.</div>
            </div>
        `;
    }

    function renderArticle(article) {
        document.title = `${article.title} | Orian's Blog`;
        const paragraphs = Array.isArray(article.content) && article.content.length > 0
            ? article.content
            : ["This article is not available yet."];
        const content = paragraphs
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

    function bindReadingProgress() {
        if (!progressBar) {
            return;
        }

        if (progressCleanup) {
            progressCleanup();
            progressCleanup = null;
        }

        const articleBody = root.querySelector(".article-body");
        if (!articleBody) {
            progressBar.style.transform = "scaleX(0)";
            return;
        }

        let rafId = 0;

        const updateProgress = () => {
            rafId = 0;

            const articleRect = articleBody.getBoundingClientRect();
            const absoluteTop = articleRect.top + window.scrollY;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const scrollableDistance = Math.max(articleBody.offsetHeight - viewportHeight, 0);

            if (scrollableDistance <= 0) {
                const isPastTop = window.scrollY > absoluteTop;
                progressBar.style.transform = `scaleX(${isPastTop ? 1 : 0})`;
                return;
            }

            const rawProgress = (window.scrollY - absoluteTop) / scrollableDistance;
            const progress = Math.min(Math.max(rawProgress, 0), 1);
            progressBar.style.transform = `scaleX(${progress})`;
        };

        const requestProgressUpdate = () => {
            if (rafId) {
                return;
            }

            rafId = window.requestAnimationFrame(updateProgress);
        };

        window.addEventListener("scroll", requestProgressUpdate, scrollListenerOptions);
        window.addEventListener("resize", requestProgressUpdate);
        requestProgressUpdate();

        progressCleanup = () => {
            window.removeEventListener("scroll", requestProgressUpdate, scrollListenerOptions);
            window.removeEventListener("resize", requestProgressUpdate);
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
        };
    }

    function bindBackNavigation() {
        if (!backButton) {
            return;
        }

        const source = getSource();
        if (source === "articles") {
            backButton.setAttribute("href", "articles.html");
            backButton.setAttribute("aria-label", "Return to articles");
        } else if (source === "home") {
            backButton.setAttribute("href", "index.html");
            backButton.setAttribute("aria-label", "Return to home");
        } else {
            backButton.setAttribute("href", "#");
            backButton.setAttribute("aria-label", "Return to previous page");
        }

        backButton.addEventListener("click", (event) => {
            event.preventDefault();

            if (source === "articles") {
                window.location.href = "articles.html";
                return;
            }

            if (source === "home") {
                window.location.href = "index.html";
                return;
            }

            // For direct-open cases (for example from desktop), prefer native history.
            if (window.history.length > 1) {
                window.history.back();
                return;
            }

            window.close();
            window.setTimeout(() => {
                if (!window.closed) {
                    window.location.href = "index.html";
                }
            }, 120);
        });
    }

    function init() {
        if (!root) {
            return;
        }

        bindBackNavigation();

        const slug = getSlug();
        const article = utils.getArticleBySlug?.(slug) ?? null;

        if (!article) {
            renderNotFound();
            return;
        }

        renderArticle(article);
        bindReadingProgress();
        window.addEventListener("pagehide", () => progressCleanup?.(), { once: true });
    }

    init();
})();
