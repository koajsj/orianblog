(() => {
    "use strict";

    const root = document.querySelector("[data-article-root]");
    const backButton = document.querySelector("[data-article-back]");
    const progressBar = document.querySelector("[data-reading-progress-bar]");
    const utils = window.OrianBlog || {};
    const scrollListenerOptions = { passive: true };
    const COMMENT_STORAGE_KEY = "orian_blog_comments_v1";
    let progressCleanup = null;
    let interactionCleanup = null;

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
        const content = renderArticleContent(paragraphs);
        const stats = utils.getArticleStats?.(article.slug) ?? { views: article.views || 0, likes: 0, bookmarked: false };

        root.innerHTML = `
            <div class="section-container article-layout">
                <header class="article-header reveal">
                    <p class="article-meta">${formatDate(article.date)} · <span data-views-count>${stats.views || 0}</span> views</p>
                    <h1 class="article-page-title">${utils.escapeHtml?.(article.title) ?? article.title}</h1>
                    <p class="article-excerpt">${utils.escapeHtml?.(article.excerpt) ?? article.excerpt}</p>
                    <div class="article-actions" data-article-actions>
                        <button type="button" class="article-action-btn" data-like-btn>
                            <i class="fas fa-thumbs-up" aria-hidden="true"></i>
                            Like <span data-likes-count>${stats.likes || 0}</span>
                        </button>
                        <button type="button" class="article-action-btn ${stats.bookmarked ? "is-active" : ""}" data-bookmark-btn>
                            <i class="fas fa-bookmark" aria-hidden="true"></i>
                            <span data-bookmark-label>${stats.bookmarked ? "Saved" : "Save"}</span>
                        </button>
                    </div>
                </header>
                <article class="article-body reveal">
                    ${content}
                </article>
                <section class="article-comments reveal" data-comment-shell>
                    <h2>Comments</h2>
                    <form class="comment-form" data-comment-form>
                        <input type="text" name="author" maxlength="28" placeholder="Your name" required>
                        <textarea name="content" maxlength="500" placeholder="Write a comment..." required></textarea>
                        <button type="submit" class="comment-submit">Post comment</button>
                    </form>
                    <div class="comment-list" data-comment-list></div>
                </section>
            </div>
        `;
    }

    function renderArticleContent(paragraphs) {
        const escape = (value) => utils.escapeHtml?.(value) ?? String(value ?? "");
        const chunks = [];
        let codeBuffer = [];
        let inCode = false;

        const flushCode = () => {
            if (codeBuffer.length === 0) {
                return;
            }
            const codeValue = escape(codeBuffer.join("\n"));
            chunks.push(`
                <div class="article-code">
                    <button type="button" class="article-code-copy" data-code-copy>Copy</button>
                    <pre><code>${codeValue}</code></pre>
                </div>
            `);
            codeBuffer = [];
        };

        paragraphs.forEach((paragraph) => {
            if (paragraph.trim() === "```") {
                if (inCode) {
                    flushCode();
                }
                inCode = !inCode;
                return;
            }

            if (inCode) {
                codeBuffer.push(paragraph);
                return;
            }

            chunks.push(`<p>${escape(paragraph)}</p>`);
        });

        flushCode();
        return chunks.join("");
    }

    function bindArticleInteractions(slug) {
        if (interactionCleanup) {
            interactionCleanup();
            interactionCleanup = null;
        }

        const views = root.querySelector("[data-views-count]");
        const likes = root.querySelector("[data-likes-count]");
        const likeBtn = root.querySelector("[data-like-btn]");
        const bookmarkBtn = root.querySelector("[data-bookmark-btn]");
        const bookmarkLabel = root.querySelector("[data-bookmark-label]");
        const copyButtons = [...root.querySelectorAll("[data-code-copy]")];

        const updateStatsView = (stats) => {
            if (views) {
                views.textContent = String(stats.views || 0);
            }
            if (likes) {
                likes.textContent = String(stats.likes || 0);
            }
            if (bookmarkBtn) {
                bookmarkBtn.classList.toggle("is-active", Boolean(stats.bookmarked));
            }
            if (bookmarkLabel) {
                bookmarkLabel.textContent = stats.bookmarked ? "Saved" : "Save";
            }
        };

        updateStatsView(utils.incrementArticleView?.(slug) ?? utils.getArticleStats?.(slug) ?? {});

        const onLike = () => updateStatsView(utils.incrementArticleLike?.(slug) ?? {});
        const onBookmark = () => updateStatsView(utils.toggleArticleBookmark?.(slug) ?? {});

        likeBtn?.addEventListener("click", onLike);
        bookmarkBtn?.addEventListener("click", onBookmark);

        const copyHandlers = copyButtons.map((button) => {
            const handler = async () => {
                const codeNode = button.parentElement?.querySelector("code");
                if (!codeNode) {
                    return;
                }

                try {
                    await navigator.clipboard.writeText(codeNode.textContent || "");
                    button.textContent = "Copied";
                } catch {
                    button.textContent = "Failed";
                }

                window.setTimeout(() => {
                    button.textContent = "Copy";
                }, 1100);
            };

            button.addEventListener("click", handler);
            return { button, handler };
        });

        interactionCleanup = () => {
            likeBtn?.removeEventListener("click", onLike);
            bookmarkBtn?.removeEventListener("click", onBookmark);
            copyHandlers.forEach(({ button, handler }) => button.removeEventListener("click", handler));
        };
    }

    function getStoredComments() {
        try {
            const parsed = JSON.parse(window.localStorage?.getItem(COMMENT_STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    function setStoredComments(allComments) {
        try {
            window.localStorage?.setItem(COMMENT_STORAGE_KEY, JSON.stringify(allComments));
        } catch {
            // Ignore storage errors.
        }
    }

    function getCommentsBySlug(slug) {
        const all = getStoredComments();
        const list = all[slug];
        return Array.isArray(list) ? list : [];
    }

    function saveComment(slug, comment) {
        const all = getStoredComments();
        const list = Array.isArray(all[slug]) ? all[slug] : [];
        all[slug] = [comment, ...list].slice(0, 50);
        setStoredComments(all);
    }

    function bindComments(slug) {
        const form = root.querySelector("[data-comment-form]");
        const listNode = root.querySelector("[data-comment-list]");
        if (!form || !listNode) {
            return;
        }

        const escape = (value) => utils.escapeHtml?.(value) ?? String(value ?? "");

        const render = () => {
            const comments = getCommentsBySlug(slug);
            if (comments.length === 0) {
                listNode.innerHTML = `<div class="empty-state">No comments yet.</div>`;
                return;
            }

            listNode.innerHTML = comments.map((comment) => `
                <article class="comment-item">
                    <p class="comment-meta">${escape(comment.author)} · ${escape(comment.time)}</p>
                    <p>${escape(comment.content)}</p>
                </article>
            `).join("");
        };

        const onSubmit = (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const author = String(formData.get("author") || "").trim();
            const content = String(formData.get("content") || "").trim();

            if (!author || !content) {
                return;
            }

            saveComment(slug, {
                author,
                content,
                time: new Date().toLocaleString("zh-CN", { hour12: false })
            });
            form.reset();
            render();
        };

        form.addEventListener("submit", onSubmit);
        render();

        const prevCleanup = interactionCleanup;
        interactionCleanup = () => {
            prevCleanup?.();
            form.removeEventListener("submit", onSubmit);
        };
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
        bindArticleInteractions(article.slug);
        bindComments(article.slug);
        window.addEventListener("pagehide", () => progressCleanup?.(), { once: true });
        window.addEventListener("pagehide", () => interactionCleanup?.(), { once: true });
    }

    init();
})();
