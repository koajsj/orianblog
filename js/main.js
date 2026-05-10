(() => {
    "use strict";

    const STAGGER_STEP_MS = 80;
    const REVEAL_STAGGER_STEP_MS = 70;
    const CARD_STAGGER_STEP_MS = 90;
    const PARALLAX_RANGE_X = 16;
    const PARALLAX_RANGE_Y = 12;
    const MAGNETIC_STRENGTH = 0.12;
    const REVEAL_THRESHOLD = 0.04;
    const REVEAL_ROOT_MARGIN = "0px 0px 14% 0px";
    const THEME_STORAGE_KEY = "orian_blog_theme";

    const selectors = {
        anchors: 'a[href^="#"]',
        hero: ".hero",
        heroContent: ".hero-content",
        heroTitle: ".hero-title",
        articleCards: ".article-card",
        magneticTargets: ".button, .resume-btn, .articles-search-toggle, .articles-archive-link, .social-link, .article-action-btn, .comment-submit",
        revealTargets: ".reveal"
    };

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerMedia = window.matchMedia("(hover: none) and (pointer: coarse)");
    const utils = window.OrianBlog || {};

    const elements = {
        body: document.body,
        hero: document.querySelector(selectors.hero),
        heroContent: document.querySelector(selectors.heroContent),
        heroTitle: document.querySelector(selectors.heroTitle)
    };

    const cleanupTasks = [];
    const motionInteractionCleanups = [];
    const scrollListenerOptions = { passive: true };
    const pointerListenerOptions = { passive: true };

    let revealObserver = null;
    let clockTimer = null;
    let scrollHandler = null;
    let scrollMotionTargets = [];
    let scrollRafScheduled = false;

    function registerCleanup(callback) {
        cleanupTasks.push(callback);
    }

    function registerMotionCleanup(callback) {
        motionInteractionCleanups.push(callback);
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
        elements.body.classList.toggle("theme-dark", theme === "dark");
    }

    function formatClock() {
        const formatter = new Intl.DateTimeFormat(utils.getLocale?.() || "zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
        return formatter.format(new Date());
    }

    function isReducedMotion() {
        return motionMedia.matches;
    }

    function isCoarsePointer() {
        return coarsePointerMedia.matches;
    }

    function addMediaQueryChangeListener(media, handler) {
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handler);
            registerCleanup(() => media.removeEventListener("change", handler));
        } else if (typeof media.addListener === "function") {
            media.addListener(handler);
            registerCleanup(() => media.removeListener(handler));
        }
    }

    function getTranslatableLabelPair() {
        const lang = utils.getLanguage?.() || "zh";
        return lang === "zh"
            ? {
                clock: "当前时间",
                theme: elements.body.classList.contains("theme-dark") ? "切换到浅色模式" : "切换到深色模式",
                language: "Switch to English"
            }
            : {
                clock: "Current time",
                theme: elements.body.classList.contains("theme-dark") ? "Switch to light mode" : "Switch to dark mode",
                language: "切换到中文"
            };
    }

    function initThemeAndClock() {
        const navActions = document.querySelector(".nav-actions");
        if (!navActions) {
            return;
        }

        const shell = document.createElement("div");
        shell.className = "nav-utilities";

        const clock = document.createElement("span");
        clock.className = "nav-clock";

        const languageToggle = document.createElement("button");
        languageToggle.type = "button";
        languageToggle.className = "language-toggle";

        const themeToggle = document.createElement("button");
        themeToggle.type = "button";
        themeToggle.className = "theme-toggle";

        const syncLabels = () => {
            const labels = getTranslatableLabelPair();
            clock.setAttribute("aria-label", labels.clock);
            clock.textContent = formatClock();
            themeToggle.setAttribute("aria-label", labels.theme);
            themeToggle.innerHTML = elements.body.classList.contains("theme-dark")
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
            languageToggle.textContent = (utils.getLanguage?.() || "zh") === "zh" ? "EN" : "中";
            languageToggle.setAttribute("aria-label", labels.language);
        };

        const preferredTheme = getStoredTheme();
        if (preferredTheme === "dark" || preferredTheme === "light") {
            applyTheme(preferredTheme);
        } else {
            applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }

        const onThemeToggleClick = () => {
            const nextTheme = elements.body.classList.contains("theme-dark") ? "light" : "dark";
            applyTheme(nextTheme);
            setStoredTheme(nextTheme);
            syncLabels();
        };

        const onLanguageToggleClick = () => {
            const current = utils.getLanguage?.() || "zh";
            utils.setLanguage?.(current === "zh" ? "en" : "zh", { notify: false });
            window.location.reload();
        };

        themeToggle.addEventListener("click", onThemeToggleClick);
        languageToggle.addEventListener("click", onLanguageToggleClick);
        registerCleanup(() => themeToggle.removeEventListener("click", onThemeToggleClick));
        registerCleanup(() => languageToggle.removeEventListener("click", onLanguageToggleClick));

        shell.append(clock, languageToggle, themeToggle);
        navActions.prepend(shell);
        syncLabels();

        const updateClock = () => {
            clock.textContent = formatClock();
        };

        clockTimer = window.setInterval(updateClock, 15_000);
        registerCleanup(() => {
            if (clockTimer) {
                window.clearInterval(clockTimer);
                clockTimer = null;
            }
        });
    }

    function resolveHashTarget(href) {
        if (!href || href === "#" || !href.startsWith("#")) {
            return null;
        }

        const raw = href.slice(1);
        if (!raw) {
            return null;
        }

        let id;
        try {
            id = decodeURIComponent(raw);
        } catch {
            return null;
        }

        const byId = document.getElementById(id);
        if (byId) {
            return byId;
        }

        if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
            try {
                return document.querySelector(`#${CSS.escape(id)}`);
            } catch {
                return null;
            }
        }

        return null;
    }

    function setRevealDelays() {
        const magneticTargets = Array.from(document.querySelectorAll(selectors.magneticTargets));
        const revealTargets = Array.from(document.querySelectorAll(selectors.revealTargets));
        const articleCards = Array.from(document.querySelectorAll(selectors.articleCards));

        magneticTargets.forEach((target, index) => {
            target.style.setProperty("--stagger-delay", `${index * STAGGER_STEP_MS}ms`);
        });
        revealTargets.forEach((target, index) => {
            target.style.setProperty("--reveal-delay", `${index * REVEAL_STAGGER_STEP_MS}ms`);
        });
        articleCards.forEach((target, index) => {
            target.style.setProperty("--card-delay", `${index * CARD_STAGGER_STEP_MS}ms`);
        });
    }

    function bindAnchorScrolling() {
        const anchors = Array.from(document.querySelectorAll(selectors.anchors));
        anchors.forEach((anchor) => {
            const onClick = (event) => {
                const target = resolveHashTarget(anchor.getAttribute("href"));
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: isReducedMotion() ? "auto" : "smooth",
                    block: "start"
                });
            };

            anchor.addEventListener("click", onClick);
            registerCleanup(() => anchor.removeEventListener("click", onClick));
        });
    }

    function bindHeroParallax() {
        if (!elements.hero || !elements.heroContent || isReducedMotion() || isCoarsePointer()) {
            return;
        }

        const onPointerMove = (event) => {
            const rect = elements.hero.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
            const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
            const offsetX = relativeX * PARALLAX_RANGE_X;
            const offsetY = relativeY * PARALLAX_RANGE_Y;
            elements.heroContent.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        };

        const onPointerLeave = () => {
            elements.heroContent.style.transform = "";
        };

        elements.hero.addEventListener("pointermove", onPointerMove, pointerListenerOptions);
        elements.hero.addEventListener("pointerleave", onPointerLeave, pointerListenerOptions);
        registerMotionCleanup(() => elements.hero?.removeEventListener("pointermove", onPointerMove, pointerListenerOptions));
        registerMotionCleanup(() => elements.hero?.removeEventListener("pointerleave", onPointerLeave, pointerListenerOptions));
        registerMotionCleanup(() => {
            if (elements.heroContent) {
                elements.heroContent.style.transform = "";
            }
        });
    }

    function bindMagneticTargets() {
        if (isReducedMotion() || isCoarsePointer()) {
            return;
        }

        const targets = Array.from(document.querySelectorAll(selectors.magneticTargets));
        targets.forEach((target) => {
            target.classList.add("magnetic-hover");

            const onPointerMove = (event) => {
                const rect = target.getBoundingClientRect();
                const offsetX = event.clientX - rect.left - rect.width / 2;
                const offsetY = event.clientY - rect.top - rect.height / 2;
                target.style.transform = `translate3d(${offsetX * MAGNETIC_STRENGTH}px, ${offsetY * MAGNETIC_STRENGTH}px, 0)`;
            };

            const onPointerLeave = () => {
                target.style.transform = "";
            };

            target.addEventListener("pointermove", onPointerMove, pointerListenerOptions);
            target.addEventListener("pointerleave", onPointerLeave, pointerListenerOptions);
            registerMotionCleanup(() => target.removeEventListener("pointermove", onPointerMove, pointerListenerOptions));
            registerMotionCleanup(() => target.removeEventListener("pointerleave", onPointerLeave, pointerListenerOptions));
            registerMotionCleanup(() => {
                target.classList.remove("magnetic-hover");
                target.style.transform = "";
            });
        });
    }

    function setupMotionInteractions() {
        bindHeroParallax();
        bindMagneticTargets();
    }

    function teardownMotionInteractions() {
        while (motionInteractionCleanups.length > 0) {
            const callback = motionInteractionCleanups.pop();
            callback();
        }
    }

    function revealAll() {
        document.querySelectorAll(selectors.revealTargets).forEach((target) => {
            target.classList.add("reveal-in");
        });
    }

    function teardownRevealObserver() {
        if (revealObserver) {
            revealObserver.disconnect();
            revealObserver = null;
        }
    }

    function bindRevealObserver() {
        teardownRevealObserver();
        scrollMotionTargets = [];

        if (isReducedMotion() || !("IntersectionObserver" in window)) {
            revealAll();
            return;
        }

        const revealTargets = Array.from(document.querySelectorAll(selectors.revealTargets));
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("reveal-in");
                if (!scrollMotionTargets.includes(entry.target)) {
                    scrollMotionTargets.push(entry.target);
                }
                revealObserver?.unobserve(entry.target);
            });
        }, {
            threshold: REVEAL_THRESHOLD,
            rootMargin: REVEAL_ROOT_MARGIN
        });

        revealTargets.forEach((target) => revealObserver?.observe(target));
    }

    function teardownScrollSoft() {
        if (scrollHandler) {
            window.removeEventListener("scroll", scrollHandler, scrollListenerOptions);
            scrollHandler = null;
        }
        scrollRafScheduled = false;
        elements.body.classList.remove("is-scrolled");
        elements.hero?.style.removeProperty("--scroll-lift");
    }

    function bindScrollSoft() {
        teardownScrollSoft();
        if (isReducedMotion()) {
            return;
        }

        const updateScrollMotion = () => {
            if (scrollMotionTargets.length === 0) {
                return;
            }

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
            scrollMotionTargets.forEach((target) => {
                const rect = target.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const offset = (viewportHeight / 2 - center) / viewportHeight;
                const clamped = Math.max(-1, Math.min(1, offset));
                const shift = clamped * 7;
                target.style.setProperty("--scroll-shift", `${shift.toFixed(2)}px`);
            });
        };

        scrollHandler = () => {
            if (scrollRafScheduled) {
                return;
            }
            scrollRafScheduled = true;
            window.requestAnimationFrame(() => {
                scrollRafScheduled = false;
                const y = window.scrollY || document.documentElement.scrollTop;
                elements.body.classList.toggle("is-scrolled", y > 8);
                if (elements.hero) {
                    const cap = isCoarsePointer() ? 7 : 10;
                    const lift = -Math.min(y * 0.014, cap);
                    elements.hero.style.setProperty("--scroll-lift", `${lift}px`);
                }
                updateScrollMotion();
            });
        };

        window.addEventListener("scroll", scrollHandler, scrollListenerOptions);
        scrollHandler();
    }

    function applyReducedMotionState() {
        elements.body.classList.remove("anim-init");
        elements.body.classList.add("anim-in");
        revealAll();
        scrollMotionTargets = [];
    }

    function startEntranceAnimation() {
        if (isReducedMotion()) {
            applyReducedMotionState();
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                elements.body.classList.remove("anim-init");
                elements.body.classList.add("anim-in");
            });
        });
    }

    function syncMotionMode() {
        if (elements.heroTitle) {
            elements.heroTitle.classList.toggle("is-breathing", !isReducedMotion());
        }
    }

    function runCleanup() {
        teardownMotionInteractions();
        teardownRevealObserver();
        while (cleanupTasks.length > 0) {
            const callback = cleanupTasks.pop();
            callback();
        }
    }

    function bindMediaListeners() {
        const onMotionChange = () => {
            teardownMotionInteractions();
            teardownScrollSoft();
            if (isReducedMotion()) {
                applyReducedMotionState();
            }
            bindRevealObserver();
            setupMotionInteractions();
            bindScrollSoft();
            syncMotionMode();
        };

        const onCoarsePointerChange = () => {
            teardownMotionInteractions();
            teardownScrollSoft();
            setupMotionInteractions();
            bindScrollSoft();
        };

        addMediaQueryChangeListener(motionMedia, onMotionChange);
        addMediaQueryChangeListener(coarsePointerMedia, onCoarsePointerChange);
        window.addEventListener("pagehide", runCleanup, { once: true });
    }

    function init() {
        initThemeAndClock();
        setRevealDelays();
        bindAnchorScrolling();
        setupMotionInteractions();
        bindRevealObserver();
        registerCleanup(teardownScrollSoft);
        bindScrollSoft();
        bindMediaListeners();
        syncMotionMode();
        startEntranceAnimation();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
