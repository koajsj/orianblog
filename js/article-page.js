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

    const I18N = {
        en: {
            notFound: "This article does not exist.",
            unavailable: "This article is not available yet.",
            views: "views",
            minRead: "min read",
            like: "Like",
            save: "Save",
            saved: "Saved",
            comments: "Comments",
            yourName: "Your name",
            writeComment: "Write a comment...",
            postComment: "Post comment",
            noComments: "No comments yet.",
            previous: "Previous",
            next: "Next",
            toc: "On this page",
            copied: "Copied",
            failed: "Failed",
            copy: "Copy",
            backArticles: "Return to articles",
            backHome: "Return to home",
            backPrev: "Return to previous page",
            backText: "Back"
        },
        zh: {
            notFound: "该文章不存在。",
            unavailable: "该文章暂不可用。",
            views: "阅读",
            minRead: "分钟阅读",
            like: "点赞",
            save: "收藏",
            saved: "已收藏",
            comments: "评论",
            yourName: "你的名字",
            writeComment: "写下你的评论...",
            postComment: "发布评论",
            noComments: "还没有评论。",
            previous: "上一篇",
            next: "下一篇",
            toc: "目录",
            copied: "已复制",
            failed: "失败",
            copy: "复制",
            backArticles: "返回文章列表",
            backHome: "返回首页",
            backPrev: "返回上一页",
            backText: "返回"
        }
    };

    function tr(key) {
        const lang = utils.getLanguage?.() || "en";
        return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function getSlug() {
        return new URLSearchParams(window.location.search).get("slug") || "";
    }

    function getSource() {
        return new URLSearchParams(window.location.search).get("from") || "";
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
        root.innerHTML = `<div class="section-container article-layout"><div class="empty-state">${tr("notFound")}</div></div>`;
    }

    function renderArticle(article) {
        document.title = `${article.title} | Orian's Blog`;
        const paragraphs = Array.isArray(article.content) && article.content.length > 0
            ? article.content
            : [tr("unavailable")];
        const { html: content, tocItems, wordCount } = renderArticleContent(paragraphs);
        const readingMinutes = Math.max(1, Math.round(wordCount / 220));
        const stats = utils.getArticleStats?.(article.slug) ?? { views: article.views || 0, likes: 0, bookmarked: false };
        const adjacent = getAdjacentArticles(article.slug);

        root.innerHTML = `
            <div class="section-container article-layout">
                <header class="article-header reveal">
                    <p class="article-meta">${formatDate(article.date)} · <span data-views-count>${stats.views || 0}</span> ${tr("views")} · ${readingMinutes} ${tr("minRead")}</p>
                    <h1 class="article-page-title">${utils.escapeHtml?.(article.title) ?? article.title}</h1>
                    <p class="article-excerpt">${utils.escapeHtml?.(article.excerpt) ?? article.excerpt}</p>
                    <div class="article-actions" data-article-actions>
                        <button type="button" class="article-action-btn" data-like-btn>
                            <i class="fas fa-thumbs-up" aria-hidden="true"></i>
                            ${tr("like")} <span data-likes-count>${stats.likes || 0}</span>
                        </button>
                        <button type="button" class="article-action-btn ${stats.bookmarked ? "is-active" : ""}" data-bookmark-btn>
                            <i class="fas fa-bookmark" aria-hidden="true"></i>
                            <span data-bookmark-label>${stats.bookmarked ? tr("saved") : tr("save")}</span>
                        </button>
                    </div>
                </header>
                ${renderToc(tocItems)}
                <article class="article-body reveal">${content}</article>
                ${renderAdjacentLinks(adjacent)}
                <section class="article-comments reveal" data-comment-shell>
                    <h2>${tr("comments")}</h2>
                    <form class="comment-form" data-comment-form>
                        <input type="text" name="author" maxlength="28" placeholder="${tr("yourName")}" required>
                        <textarea name="content" maxlength="500" placeholder="${tr("writeComment")}" required></textarea>
                        <button type="submit" class="comment-submit">${tr("postComment")}</button>
                    </form>
                    <div class="comment-list" data-comment-list></div>
                </section>
            </div>
        `;

        updateArticleSeo(article, readingMinutes);
    }

    function renderArticleContent(paragraphs) {
        const escape = (value) => utils.escapeHtml?.(value) ?? String(value ?? "");
        const chunks = [];
        const tocItems = [];
        let codeBuffer = [];
        let inCode = false;
        let headingIndex = 0;
        let wordCount = 0;

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
            const codeValue = highlightCode(codeBuffer.join("\n"), escape);
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
            const words = trimmed.match(/[A-Za-z0-9\u4e00-\u9fa5]+/g) || [];
            wordCount += words.length;
            chunks.push(`<p>${escape(paragraph)}</p>`);
        });

        flushCode();
        return { html: chunks.join(""), tocItems, wordCount };
    }

    function highlightCode(codeRaw, escape) {
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
            return "";
        }
        const escape = (value) => utils.escapeHtml?.(value) ?? String(value ?? "");
        const list = tocItems.map((item) => `
            <a href="#${escape(item.id)}" class="article-toc-link ${item.level === 3 ? "is-sub" : ""}">${escape(item.text)}</a>
        `).join("");
        return `
            <nav class="article-toc reveal" aria-label="Table of contents">
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
        const escape = (value) => utils.escapeHtml?.(value) ?? String(value ?? "");
        return `
            <nav class="article-neighbors reveal" aria-label="Article navigation">
                ${prev ? `<a class="article-neighbor" href="${toHref(prev.slug)}"><span class="article-neighbor-kicker">${tr("previous")}</span><strong>${escape(prev.title)}</strong></a>` : '<span class="article-neighbor-spacer"></span>'}
                ${next ? `<a class="article-neighbor is-next" href="${toHref(next.slug)}"><span class="article-neighbor-kicker">${tr("next")}</span><strong>${escape(next.title)}</strong></a>` : '<span class="article-neighbor-spacer"></span>'}
            </nav>
        `;
    }

    function updateArticleSeo(article, readingMinutes) {
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

        const title = `${article.title} | Orian's Blog`;
        const description = article.excerpt || `Read ${article.title} on Orian's Blog.`;
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
            publisher: { "@type": "Organization", name: "Orian's Blog" },
            timeRequired: `PT${readingMinutes}M`
        });
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
                bookmarkLabel.textContent = stats.bookmarked ? tr("saved") : tr("save");
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
                listNode.innerHTML = `<div class="empty-state">${tr("noComments")}</div>`;
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
                progressBar.style.transform = `scaleX(${window.scrollY > absoluteTop ? 1 : 0})`;
                return;
            }
            const rawProgress = (window.scrollY - absoluteTop) / scrollableDistance;
            progressBar.style.transform = `scaleX(${Math.min(Math.max(rawProgress, 0), 1)})`;
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

        const setBackText = () => {
            if (backButton.childNodes.length > 0) {
                backButton.childNodes[backButton.childNodes.length - 1].nodeValue = ` ${tr("backText")}`;
            }
        };

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
        setBackText();

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
            window.close();
            window.setTimeout(() => {
                if (!window.closed) {
                    window.location.href = "index.html";
                }
            }, 120);
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

        window.addEventListener("orian:languagechange", () => {
            try {
                const next = renderCurrentArticle();
                if (!next) {
                    window.location.reload();
                }
            } catch {
                window.location.reload();
            }
        });
        window.addEventListener("pagehide", () => progressCleanup?.(), { once: true });
        window.addEventListener("pagehide", () => interactionCleanup?.(), { once: true });
    }

    init();
})();
