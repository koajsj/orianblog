(() => {
    "use strict";

    const THEME_STORAGE_KEY = "orian_blog_theme";
    const STAGGER_STEP_MS = 80;
    const REVEAL_STAGGER_STEP_MS = 70;
    const CARD_STAGGER_STEP_MS = 90;
    const REVEAL_THRESHOLD = 0.04;
    const REVEAL_ROOT_MARGIN = "0px 0px 14% 0px";

    const selectors = {
        anchors: 'a[href^="#"]',
        articleCards: ".article-card",
        motionTargets: ".button, .resume-btn, .articles-archive-link, .article-action-btn, .comment-submit",
        revealTargets: ".reveal"
    };

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const utils = window.OrianBlog || {};
    const body = document.body;
    const navActions = document.querySelector(".nav-actions");

    let revealObserver = null;
    let controlsMounted = false;

    function isReducedMotion() {
        return motionMedia.matches;
    }

    function getStoredTheme() {
        try {
            return window.localStorage?.getItem(THEME_STORAGE_KEY) || "";
        } catch {
            return "";
        }
    }

    function setStoredTheme(theme) {
        try {
            window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore storage errors.
        }
    }

    function applyTheme(theme) {
        body.classList.toggle("theme-dark", theme === "dark");
    }

    function getCurrentTheme() {
        return body.classList.contains("theme-dark") ? "dark" : "light";
    }

    function getLabels() {
        const lang = utils.getLanguage?.() || "en";
        const isDark = getCurrentTheme() === "dark";

        if (lang === "zh") {
            return {
                language: "切换到英文",
                languageText: "EN",
                theme: isDark ? "切换到浅色模式" : "切换到深色模式"
            };
        }

        return {
            language: "Switch to Chinese",
            languageText: "中",
            theme: isDark ? "Switch to light mode" : "Switch to dark mode"
        };
    }

    function resolvePreferredTheme() {
        const stored = getStoredTheme();
        if (stored === "dark" || stored === "light") {
            return stored;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function mountThemeAndLanguageControls() {
        if (!navActions || controlsMounted) {
            return;
        }

        const shell = document.createElement("div");
        shell.className = "nav-utilities";
        shell.setAttribute("data-global-controls", "true");

        const languageToggle = document.createElement("button");
        languageToggle.type = "button";
        languageToggle.className = "language-toggle";

        const themeToggle = document.createElement("button");
        themeToggle.type = "button";
        themeToggle.className = "theme-toggle";

        const syncControls = () => {
            const labels = getLabels();
            languageToggle.textContent = labels.languageText;
            languageToggle.setAttribute("aria-label", labels.language);
            themeToggle.setAttribute("aria-label", labels.theme);
            themeToggle.innerHTML = getCurrentTheme() === "dark"
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
        };

        languageToggle.addEventListener("click", () => {
            const current = utils.getLanguage?.() || "en";
            const next = current === "zh" ? "en" : "zh";
            utils.setLanguage?.(next, { notify: false });
            document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
            window.location.reload();
        });

        themeToggle.addEventListener("click", () => {
            const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            setStoredTheme(nextTheme);
            syncControls();
        });

        shell.append(languageToggle, themeToggle);
        navActions.prepend(shell);
        controlsMounted = true;

        applyTheme(resolvePreferredTheme());
        syncControls();

        window.addEventListener("orian:languagechange", syncControls);
    }

    function setRevealDelays() {
        Array.from(document.querySelectorAll(selectors.motionTargets)).forEach((target, index) => {
            target.style.setProperty("--stagger-delay", `${index * STAGGER_STEP_MS}ms`);
        });

        Array.from(document.querySelectorAll(selectors.revealTargets)).forEach((target, index) => {
            target.style.setProperty("--reveal-delay", `${index * REVEAL_STAGGER_STEP_MS}ms`);
        });

        Array.from(document.querySelectorAll(selectors.articleCards)).forEach((target, index) => {
            target.style.setProperty("--card-delay", `${index * CARD_STAGGER_STEP_MS}ms`);
        });
    }

    function bindAnchorScrolling() {
        Array.from(document.querySelectorAll(selectors.anchors)).forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const href = anchor.getAttribute("href");
                if (!href || !href.startsWith("#") || href === "#") {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: isReducedMotion() ? "auto" : "smooth",
                    block: "start"
                });
            });
        });
    }

    function revealAll() {
        document.querySelectorAll(selectors.revealTargets).forEach((target) => {
            target.classList.add("reveal-in");
        });
    }

    function bindRevealObserver() {
        revealObserver?.disconnect();
        revealObserver = null;

        if (isReducedMotion() || !("IntersectionObserver" in window)) {
            revealAll();
            return;
        }

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("reveal-in");
                revealObserver?.unobserve(entry.target);
            });
        }, {
            threshold: REVEAL_THRESHOLD,
            rootMargin: REVEAL_ROOT_MARGIN
        });

        document.querySelectorAll(selectors.revealTargets).forEach((target) => {
            revealObserver?.observe(target);
        });
    }

    function startEntranceAnimation() {
        if (isReducedMotion()) {
            body.classList.remove("anim-init");
            body.classList.add("anim-in");
            revealAll();
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                body.classList.remove("anim-init");
                body.classList.add("anim-in");
            });
        });
    }

    function init() {
        mountThemeAndLanguageControls();
        setRevealDelays();
        bindAnchorScrolling();
        bindRevealObserver();
        startEntranceAnimation();

        window.addEventListener("pagehide", () => {
            revealObserver?.disconnect();
            revealObserver = null;
        }, { once: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
