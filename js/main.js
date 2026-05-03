(() => {
    "use strict";

    const STAGGER_STEP_MS = 90;
    const REVEAL_STAGGER_STEP_MS = 70;
    const CARD_STAGGER_STEP_MS = 85;
    const PARALLAX_RANGE_X = 14;
    const PARALLAX_RANGE_Y = 10;
    const MAGNETIC_STRENGTH = 0.12;
    const REVEAL_THRESHOLD = 0.03;
    const REVEAL_ROOT_MARGIN = "0px 0px 18% 0px";

    const selectors = {
        anchors: 'a[href^="#"]',
        hero: ".hero",
        heroContent: ".hero-content",
        heroTitle: ".hero-title",
        articleCards: ".article-card",
        magneticTargets: ".social-icons a, .resume-btn",
        revealTargets: ".reveal"
    };

    const THEME_STORAGE_KEY = "orian_blog_theme";
    const utils = window.OrianBlog || {};

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerMedia = window.matchMedia("(hover: none) and (pointer: coarse)");

    const elements = {
        body: document.body,
        hero: document.querySelector(selectors.hero),
        heroContent: document.querySelector(selectors.heroContent),
        heroTitle: document.querySelector(selectors.heroTitle),
        articleCards: Array.from(document.querySelectorAll(selectors.articleCards)),
        anchors: Array.from(document.querySelectorAll(selectors.anchors)),
        magneticTargets: Array.from(document.querySelectorAll(selectors.magneticTargets)),
        revealTargets: Array.from(document.querySelectorAll(selectors.revealTargets))
    };

    const cleanupTasks = [];
    const motionInteractionCleanups = [];
    let revealObserver = null;
    let clockTimer = null;
    let scrollMotionTargets = [];

    const scrollListenerOptions = { passive: true };
    let scrollRafScheduled = false;
    let scrollHandler = null;

    function registerCleanup(callback) {
        cleanupTasks.push(callback);
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

    function formatClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }

    function applyTheme(theme) {
        elements.body.classList.toggle("theme-dark", theme === "dark");
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
        clock.setAttribute("aria-label", "Current time");
        clock.textContent = formatClock();

        const languageToggle = document.createElement("button");
        languageToggle.type = "button";
        languageToggle.className = "language-toggle";

        const themeToggle = document.createElement("button");
        themeToggle.type = "button";
        themeToggle.className = "theme-toggle";

        const syncThemeLabel = () => {
            const isDark = elements.body.classList.contains("theme-dark");
            themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
            themeToggle.innerHTML = isDark
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
        };

        const syncLanguageLabel = () => {
            const lang = utils.getLanguage?.() || "en";
            languageToggle.textContent = lang === "zh" ? "EN" : "中";
            languageToggle.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
        };

        const preferredTheme = getStoredTheme();
        if (preferredTheme === "dark" || preferredTheme === "light") {
            applyTheme(preferredTheme);
        } else {
            applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }
        syncThemeLabel();
        syncLanguageLabel();

        const onThemeToggleClick = () => {
            const nextTheme = elements.body.classList.contains("theme-dark") ? "light" : "dark";
            applyTheme(nextTheme);
            setStoredTheme(nextTheme);
            syncThemeLabel();
        };

        const onLanguageToggleClick = () => {
            const current = utils.getLanguage?.() || "en";
            utils.setLanguage?.(current === "zh" ? "en" : "zh");
            window.location.reload();
        };

        const onLanguageChange = () => {
            syncLanguageLabel();
        };

        themeToggle.addEventListener("click", onThemeToggleClick);
        languageToggle.addEventListener("click", onLanguageToggleClick);
        window.addEventListener("orian:languagechange", onLanguageChange);

        registerCleanup(() => themeToggle.removeEventListener("click", onThemeToggleClick));
        registerCleanup(() => languageToggle.removeEventListener("click", onLanguageToggleClick));
        registerCleanup(() => window.removeEventListener("orian:languagechange", onLanguageChange));

        shell.append(clock, languageToggle, themeToggle);
        navActions.prepend(shell);

        const updateClock = () => {
            clock.textContent = formatClock();
        };

        updateClock();
        clockTimer = window.setInterval(updateClock, 1000 * 15);
        registerCleanup(() => {
            if (clockTimer) {
                window.clearInterval(clockTimer);
                clockTimer = null;
            }
        });
    }

    function registerMotionCleanup(callback) {
        motionInteractionCleanups.push(callback);
    }

    function teardownMotionInteractions() {
        while (motionInteractionCleanups.length > 0) {
            const callback = motionInteractionCleanups.pop();
            callback();
        }
    }

    function teardownRevealObserver() {
        if (revealObserver) {
            revealObserver.disconnect();
            revealObserver = null;
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
        elements.magneticTargets.forEach((target, index) => {
            target.style.setProperty("--stagger-delay", `${index * STAGGER_STEP_MS}ms`);
        });
        elements.revealTargets.forEach((target, index) => {
            target.style.setProperty("--reveal-delay", `${index * REVEAL_STAGGER_STEP_MS}ms`);
        });
        elements.articleCards.forEach((target, index) => {
            target.style.setProperty("--card-delay", `${index * CARD_STAGGER_STEP_MS}ms`);
        });
    }

    function bindAnchorScrolling() {
        elements.anchors.forEach((anchor) => {
            const onClick = (event) => {
                const href = anchor.getAttribute("href");
                const target = resolveHashTarget(href);
                if (!target) {
                    event.preventDefault();
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

    const pointerListenerOptions = { passive: true };

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

        elements.magneticTargets.forEach((target) => {
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
                const shift = clamped * 6;
                target.style.setProperty("--scroll-shift", `${shift.toFixed(2)}px`);
            });
        };

        scrollHandler = () => {
            if (scrollRafScheduled) {
                return;
            }
            scrollRafScheduled = true;
            requestAnimationFrame(() => {
                scrollRafScheduled = false;
                const y = window.scrollY || document.documentElement.scrollTop;
                elements.body.classList.toggle("is-scrolled", y > 6);
                if (elements.hero) {
                    const cap = isCoarsePointer() ? 6 : 9;
                    const lift = -Math.min(y * 0.013, cap);
                    elements.hero.style.setProperty("--scroll-lift", `${lift}px`);
                }
                updateScrollMotion();
            });
        };

        window.addEventListener("scroll", scrollHandler, scrollListenerOptions);
        scrollHandler();
    }

    function revealAll() {
        elements.revealTargets.forEach((target) => {
            target.classList.add("reveal-in");
        });
    }

    function bindRevealObserver() {
        teardownRevealObserver();
        scrollMotionTargets = [];

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
                if (!scrollMotionTargets.includes(entry.target)) {
                    scrollMotionTargets.push(entry.target);
                }
                revealObserver?.unobserve(entry.target);
            });
        }, { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN });

        elements.revealTargets.forEach((target) => revealObserver?.observe(target));
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
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
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
