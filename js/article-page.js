(() => {
    "use strict";

    const COMMENT_STORAGE_KEY = "orian_blog_comments_v1";
    const root = document.querySelector("[data-article-root]");
    const backButton = document.querySelector("[data-article-back]");
    const progressBar = document.querySelector("[data-reading-progress-bar]");
    const scrollListenerOptions = { passive: true };
    const utils = window.OrianBlog || {};

    let progressCleanup = null;
    let interactionCleanup = null;
    let tocCleanup = null;

    const I18N = {
        zh: {
            siteTitle: "Orian's Blog",
            notFound: "这篇文章不存在。",
            unavailable: "这篇文章暂时还没有内容。",
            views: "阅读",
            likes: "喜欢",
            like: "点赞",
            save: "收藏",
            saved: "已收藏",
            copyLink: "复制链接",
            copied: "已复制",
            failed: "失败",
            comments: "评论",
            commentCount: "{count} 条评论",
            yourName: "你的名字",
            writeComment: "写下你的评论……",
            postComment: "发布评论",
            noComments: "还没有评论。",
            previous: "上一篇",
            next: "下一篇",
            toc: "目录",
            tocEmpty: "这篇文章没有分节标题。",
            copy: "复制",
            backArticles: "返回文章列表",
            backHome: "返回首页",
            backPrev: "返回上一页",
            backText: "返回",
            articleKicker: "文章",
            sidebarSummary: "快速定位目录、阅读状态和相邻文章。",
            readingProgress: "阅读进度",
            shareStatus: "链接已复制到剪贴板"
        },
        en: {
            siteTitle: "Orian's Blog",
            notFound: "This article does not exist.",
            unavailable: "This article is not available yet.",
            views: "views",
            likes: "likes",
            like: "Like",
            save: "Save",
            saved: "Saved",
            copyLink: "Copy link",
            copied: "Copied",
            failed: "Failed",
            comments: "Comments",
            commentCount: "{count} comments",
            yourName: "Your name",
            writeComment: "Write a comment…",
            postComment: "Post comment",
            noComments: "No comments yet.",
            previous: "Previous",
            next: "Next",
            toc: "On this page",
            tocEmpty: "This article does not use section headings.",
            copy: "Copy",
            backArticles: "Return to articles",
            backHome: "Return to home",
            backPrev: "Return to previous page",
            backText: "Back",
            articleKicker: "Article",
            sidebarSummary: "Use the sidebar for quick orientation, reading progress, and adjacent links.",
            readingProgress: "Reading progress",
            shareStatus: "Link copied to clipboard"
        }
    };

    function tr(key) {
        const lang = utils.getLanguage?.() || "zh";
        return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function escape(value) {
        return utils.escapeHtml?.(value) ?? String(value ?? "");
    }

    function getSlug() {
        return new URLSearchParams(window.location.search).get("slug") || "";
    }

    function getSource() {
        return new URLSearchParams(window.location.search).get("from") || "";
    }

    function formatDate(value) {
        return utils.formatDate?.(value, {
            year: "numeric",
            month: utils.getLanguage?.() === "zh" ? "numeric" : "long",
            day: "numeric"
        }) ?? value ?? "";
    }

    function renderNotFound() {
        document.title = `${tr("notFound")} | ${tr("siteTitle")}`;
        if (progressBar) {
            progressBar.style.transform = "scaleX(0)";
        }
        root.innerHTML = `<div class="section-container article-layout"><div class="empty-state"><strong>${tr("notFound")}</strong></div></div>`;
    }

    function renderArticle(article) {
        document.title = `${article.title} | ${tr("siteTitle")}`;
        const paragraphs = Array.isArray(article.content) && article.content.length > 0
            ? article.content
            : [tr("unavailable")];
        const { html: content, tocItems } = renderArticleContent(paragraphs);
        const stats = utils.getArticleStats?.(article.slug) ?? { views: article.views || 0, likes: article.likes || 0, bookmarked: false };
        const adjacent = getAdjacentArticles(article.slug);
        const commentCount = getCommentsBySlug(article.slug).length;

        root.innerHTML = `
            <div class="section-container article-layout">
                <aside class="article-sidebar reveal">
                    <div class="article-sidebar-card">
                        <p class="article-sidebar-kicker">${tr("articleKicker")}</p>
                        <p class="article-sidebar-copy">${tr("sidebarSummary")}</p>
                        <div class="article-sidebar-stats">
                            <div class="article-mini-stat">
                                <span class="article-mini-stat-value" data-views-count>${stats.views || 0}</span>
                                <span class="article-mini-stat-label">${tr("views")}</span>
                            </div>
                            <div class="article-mini-stat">
                                <span class="article-mini-stat-value" data-likes-count>${stats.likes || 0}</span>
                                <span class="article-mini-stat-label">${tr("likes")}</span>
                            </div>
                        </div>
                        <div class="article-progress-panel">
                            <span class="article-progress-label">${tr("readingProgress")}</span>
                            <span class="article-progress-value" data-reading-progress-label>0%</span>
                        </div>
                        ${renderToc(tocItems)}
                    </div>
                </aside>
                <div class="article-content-shell">
                    <header class="article-header reveal">
                        <p class="article-meta">${formatDate(article.date)} · <span data-views-count-inline>${stats.views || 0}</span> ${tr("views")}</p>
                        <h1 class="article-page-title">${escape(article.title)}</h1>
                        <p class="article-excerpt">${escape(article.excerpt)}</p>
                        <div class="article-actions" data-article-actions>
                            <button type="button" class="article-action-btn" data-like-btn>
                                <i class="fas fa-thumbs-up" aria-hidden="true"></i>
                                ${tr("like")} <span data-likes-count-inline>${stats.likes || 0}</span>
                            </button>
                            <button type="button" class="article-action-btn ${stats.bookmarked ? "is-active" : ""}" data-bookmark-btn>
                                <i class="fas fa-bookmark" aria-hidden="true"></i>
                                <span data-bookmark-label>${stats.bookmarked ? tr("saved") : tr("save")}</span>
                            </button>
                            <button type="button" class="article-action-btn" data-copy-link-btn>
                                <i class="fas fa-link" aria-hidden="true"></i>
                                <span data-copy-link-label>${tr("copyLink")}</span>
                            </button>
                        </div>
                    </header>
                    <article class="article-body reveal">${content}</article>
                    ${renderAdjacentLinks(adjacent)}
                    <section class="article-comments reveal" data-comment-shell>
                        <div class="article-comments-head">
                            <h2>${tr("comments")}</h2>
                            <p class="article-comments-count" data-comments-count>${tr("commentCount").replace("{count}", String(commentCount))}</p>
                        </div>
                        <form class="comment-form" data-comment-form>
                            <input type="text" name="author" maxlength="28" placeholder="${tr("yourName")}" required>
                            <textarea name="content" maxlength="500" placeholder="${tr("writeComment")}" required></textarea>
                            <button type="submit" class="comment-submit">${tr("postComment")}</button>
                        </form>
                        <div class="comment-list" data-comment-list></div>
                    </section>
                </div>
            </div>
        `;

        updateArticleSeo(article);
    }

    function renderArticleContent(paragraphs) {
        const chunks = [];
        const tocItems = [];
        let codeBuffer = [];
        let inCode = false;
        let headingIndex = 0;

        const slugify = (value) => String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "section";

        const pushHeading = (level, text) => {
            headingIndex += 1;
            const id = `section-${slugify(text)}-${headingIndex}`;
            tocItems.push({ id, text, level });
            chunks.push(`<h${level} id="${id}">${escape(text)}</h${level}>`);
        };

        const flushCode = () => {
            if (codeBuffer.length === 0) {
                return;
            }

            const codeValue = highlightCode(codeBuffer.join("\n"));
            chunks.push(`
                <div class="article-code">
                    <button type="button" class="article-code-copy" data-code-copy>${tr("copy")}</button>
                    <pre><code>${codeValue}</code></pre>
                </div>
            `);
            codeBuffer = [];
        };

        paragraphs.forEach((paragraph) => {
            const trimmed = paragraph.trim();

            if (trimmed === "```") {
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

            if (trimmed.startsWith("### ")) {
                pushHeading(3, trimmed.replace(/^###\s+/, ""));
                return;
            }

            if (trimmed.startsWith("## ")) {
                pushHeading(2, trimmed.replace(/^##\s+/, ""));
                return;
            }

            chunks.push(`<p>${escape(paragraph)}</p>`);
        });

        flushCode();
        return { html: chunks.join(""), tocItems };
    }

    function highlightCode(codeRaw) {
        return escape(codeRaw).split("\n").map((line) => {
            let next = line
                .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>')
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|async|await|try|catch|throw)\b/g, '<span class="code-keyword">$1</span>')
                .replace(/\b(true|false|null|undefined|NaN)\b/g, '<span class="code-constant">$1</span>')
                .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-number">$1</span>');

            if (next.includes("//")) {
                next = next.replace(/(\/\/.*)$/g, '<span class="code-comment">$1</span>');
            }

            return next;
        }).join("\n");
    }

    function renderToc(tocItems) {
        if (!Array.isArray(tocItems) || tocItems.length === 0) {
            return `
                <div class="article-toc article-toc-empty">
                    <p class="article-toc-title">${tr("toc")}</p>
                    <p class="article-toc-empty-copy">${tr("tocEmpty")}</p>
                </div>
            `;
        }

        const list = tocItems.map((item) => `
            <a href="#${escape(item.id)}" class="article-toc-link ${item.level === 3 ? "is-sub" : ""}" data-toc-link="${escape(item.id)}">${escape(item.text)}</a>
        `).join("");

        return `
            <nav class="article-toc" aria-label="${tr("toc")}">
                <p class="article-toc-title">${tr("toc")}</p>
                <div class="article-toc-list">${list}</div>
            </nav>
        `;
    }

    function getAdjacentArticles(currentSlug) {
        const articles = utils.getArticles?.() ?? [];
        const index = articles.findIndex((item) => item.slug === currentSlug);
        if (index < 0) {
            return { prev: null, next: null };
        }

        return {
            prev: articles[index + 1] || null,
            next: articles[index - 1] || null
        };
    }

    function renderAdjacentLinks({ prev, next }) {
        if (!prev && !next) {
            return "";
        }

        const source = getSource() === "articles" ? "articles" : "home";
        const toHref = (slug) => `article.html?slug=${encodeURIComponent(slug)}&from=${source}`;

        return `
            <nav class="article-neighbors reveal" aria-label="Article navigation">
                ${prev ? `<a class="article-neighbor" href="${toHref(prev.slug)}"><span class="article-neighbor-kicker">${tr("previous")}</span><strong>${escape(prev.title)}</strong></a>` : '<span class="article-neighbor-spacer"></span>'}
                ${next ? `<a class="article-neighbor is-next" href="${toHref(next.slug)}"><span class="article-neighbor-kicker">${tr("next")}</span><strong>${escape(next.title)}</strong></a>` : '<span class="article-neighbor-spacer"></span>'}
            </nav>
        `;
    }

    function updateArticleSeo(article) {
        const ensureMeta = (attribute, key, value) => {
            if (!value) {
                return;
            }
            let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
            if (!node) {
                node = document.createElement("meta");
                node.setAttribute(attribute, key);
                document.head.appendChild(node);
            }
            node.setAttribute("content", value);
        };

        const title = `${article.title} | ${tr("siteTitle")}`;
        const description = article.excerpt || `Read ${article.title} on ${tr("siteTitle")}.`;
        const canonicalUrl = new URL(`article.html?slug=${encodeURIComponent(article.slug)}`, window.location.href).toString();

        ensureMeta("name", "description", description);
        ensureMeta("property", "og:title", title);
        ensureMeta("property", "og:description", description);
        ensureMeta("property", "og:type", "article");
        ensureMeta("property", "og:url", canonicalUrl);
        ensureMeta("name", "twitter:card", "summary_large_image");
        ensureMeta("name", "twitter:title", title);
        ensureMeta("name", "twitter:description", description);

        let ld = document.getElementById("article-ld-json");
        if (!ld) {
            ld = document.createElement("script");
            ld.type = "application/ld+json";
            ld.id = "article-ld-json";
            document.head.appendChild(ld);
        }
        ld.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description,
            datePublished: article.date || undefined,
            dateModified: article.date || undefined,
            mainEntityOfPage: canonicalUrl,
            author: { "@type": "Person", name: "Orian" },
            publisher: { "@type": "Organization", name: tr("siteTitle") }
        });
    }

    function bindArticleInteractions(slug) {
        interactionCleanup?.();
        interactionCleanup = null;

        const viewsBlocks = [...root.querySelectorAll("[data-views-count], [data-views-count-inline]")];
        const likesBlocks = [...root.querySelectorAll("[data-likes-count], [data-likes-count-inline]")];
        const likeBtn = root.querySelector("[data-like-btn]");
        const bookmarkBtn = root.querySelector("[data-bookmark-btn]");
        const bookmarkLabel = root.querySelector("[data-bookmark-label]");
        const copyLinkBtn = root.querySelector("[data-copy-link-btn]");
        const copyLinkLabel = root.querySelector("[data-copy-link-label]");
        const copyButtons = [...root.querySelectorAll("[data-code-copy]")];

        const updateStatsView = (stats) => {
            viewsBlocks.forEach((node) => {
                node.textContent = String(stats.views || 0);
            });
            likesBlocks.forEach((node) => {
                node.textContent = String(stats.likes || 0);
            });
            if (bookmarkBtn) {
                bookmarkBtn.classList.toggle("is-active", Boolean(stats.bookmarked));
            }
            if (bookmarkLabel) {
                bookmarkLabel.textContent = stats.bookmarked ? tr("saved") : tr("save");
            }
        };

        updateStatsView(utils.incrementArticleView?.(slug) ?? utils.getArticleStats?.(slug) ?? {});

        const onLike = () => updateStatsView(utils.incrementArticleLike?.(slug) ?? {});
        const onBookmark = () => updateStatsView(utils.toggleArticleBookmark?.(slug) ?? {});
        const onCopyLink = async () => {
            if (!copyLinkLabel) {
                return;
            }

            try {
                await navigator.clipboard.writeText(window.location.href);
                copyLinkLabel.textContent = tr("copied");
                copyLinkBtn?.setAttribute("aria-label", tr("shareStatus"));
            } catch {
                copyLinkLabel.textContent = tr("failed");
            }

            window.setTimeout(() => {
                copyLinkLabel.textContent = tr("copyLink");
            }, 1200);
        };

        likeBtn?.addEventListener("click", onLike);
        bookmarkBtn?.addEventListener("click", onBookmark);
        copyLinkBtn?.addEventListener("click", onCopyLink);

        const copyHandlers = copyButtons.map((button) => {
            const handler = async () => {
                const codeNode = button.parentElement?.querySelector("code");
                if (!codeNode) {
                    return;
                }
                try {
                    await navigator.clipboard.writeText(codeNode.textContent || "");
                    button.textContent = tr("copied");
                } catch {
                    button.textContent = tr("failed");
                }
                window.setTimeout(() => {
                    button.textContent = tr("copy");
                }, 1100);
            };
            button.addEventListener("click", handler);
            return { button, handler };
        });

        interactionCleanup = () => {
            likeBtn?.removeEventListener("click", onLike);
            bookmarkBtn?.removeEventListener("click", onBookmark);
            copyLinkBtn?.removeEventListener("click", onCopyLink);
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
        const countNode = root.querySelector("[data-comments-count]");
        if (!form || !listNode || !countNode) {
            return;
        }

        const render = () => {
            const comments = getCommentsBySlug(slug);
            countNode.textContent = tr("commentCount").replace("{count}", String(comments.length));
            if (comments.length === 0) {
                listNode.innerHTML = `<div class="empty-state"><strong>${tr("noComments")}</strong></div>`;
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
                time: new Date().toLocaleString(utils.getLocale?.() || "zh-CN", { hour12: false })
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
        progressCleanup?.();
        progressCleanup = null;

        const articleBody = root.querySelector(".article-body");
        const progressLabel = root.querySelector("[data-reading-progress-label]");
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
            let value = 0;

            if (scrollableDistance <= 0) {
                value = window.scrollY > absoluteTop ? 1 : 0;
            } else {
                value = Math.min(Math.max((window.scrollY - absoluteTop) / scrollableDistance, 0), 1);
            }

            progressBar.style.transform = `scaleX(${value})`;
            if (progressLabel) {
                progressLabel.textContent = `${Math.round(value * 100)}%`;
            }
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

    function bindTocSpy() {
        tocCleanup?.();
        tocCleanup = null;

        const headings = [...root.querySelectorAll(".article-body h2, .article-body h3")];
        const tocLinks = [...root.querySelectorAll("[data-toc-link]")];
        if (headings.length === 0 || tocLinks.length === 0) {
            return;
        }

        const linkMap = new Map(
            tocLinks.map((link) => [link.getAttribute("data-toc-link"), link])
        );

        let rafId = 0;
        const updateActiveToc = () => {
            rafId = 0;
            const current = headings.findLast?.((heading) => heading.getBoundingClientRect().top <= 160)
                || [...headings].reverse().find((heading) => heading.getBoundingClientRect().top <= 160)
                || headings[0];

            tocLinks.forEach((link) => {
                link.classList.toggle("is-active", link === linkMap.get(current.id));
            });
        };

        const requestUpdate = () => {
            if (rafId) {
                return;
            }
            rafId = window.requestAnimationFrame(updateActiveToc);
        };

        window.addEventListener("scroll", requestUpdate, scrollListenerOptions);
        window.addEventListener("resize", requestUpdate);
        requestUpdate();

        tocCleanup = () => {
            window.removeEventListener("scroll", requestUpdate, scrollListenerOptions);
            window.removeEventListener("resize", requestUpdate);
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
            backButton.setAttribute("aria-label", tr("backArticles"));
        } else if (source === "home") {
            backButton.setAttribute("href", "index.html");
            backButton.setAttribute("aria-label", tr("backHome"));
        } else {
            backButton.setAttribute("href", "#");
            backButton.setAttribute("aria-label", tr("backPrev"));
        }

        if (backButton.childNodes.length > 0) {
            backButton.childNodes[backButton.childNodes.length - 1].nodeValue = ` ${tr("backText")}`;
        }

        backButton.onclick = (event) => {
            event.preventDefault();
            if (source === "articles") {
                window.location.href = "articles.html";
                return;
            }
            if (source === "home") {
                window.location.href = "index.html";
                return;
            }
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            window.location.href = "index.html";
        };
    }

    function renderCurrentArticle() {
        const slug = getSlug();
        const article = utils.getArticleBySlug?.(slug) ?? null;
        if (!article) {
            renderNotFound();
            return null;
        }

        renderArticle(article);
        bindReadingProgress();
        bindArticleInteractions(article.slug);
        bindComments(article.slug);
        bindTocSpy();
        bindBackNavigation();
        return article;
    }

    function init() {
        if (!root) {
            return;
        }

        const article = renderCurrentArticle();
        if (!article) {
            return;
        }

        window.addEventListener("pagehide", () => progressCleanup?.(), { once: true });
        window.addEventListener("pagehide", () => interactionCleanup?.(), { once: true });
        window.addEventListener("pagehide", () => tocCleanup?.(), { once: true });
    }

    init();
})();
