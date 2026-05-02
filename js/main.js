(() => {
    "use strict";

    const STAGGER_STEP_MS = 90;
    const REVEAL_STAGGER_STEP_MS = 70;
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
        magneticTargets: ".social-icons a, .resume-btn",
        revealTargets: ".reveal"
    };

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerMedia = window.matchMedia("(hover: none) and (pointer: coarse)");

    const elements = {
        body: document.body,
        hero: document.querySelector(selectors.hero),
        heroContent: document.querySelector(selectors.heroContent),
        heroTitle: document.querySelector(selectors.heroTitle),
        anchors: Array.from(document.querySelectorAll(selectors.anchors)),
        magneticTargets: Array.from(document.querySelectorAll(selectors.magneticTargets)),
        revealTargets: Array.from(document.querySelectorAll(selectors.revealTargets))
    };

    const cleanupTasks = [];
    const motionInteractionCleanups = [];

    const scrollListenerOptions = { passive: true };
    let scrollRafScheduled = false;
    let scrollHandler = null;

    function registerCleanup(callback) {
        cleanupTasks.push(callback);
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

    function runCleanup() {
        teardownMotionInteractions();
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

        const hero = elements.hero;
        const heroContent = elements.heroContent;

        const onPointerMove = (event) => {
            const rect = hero.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
            const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
            const offsetX = relativeX * PARALLAX_RANGE_X;
            const offsetY = relativeY * PARALLAX_RANGE_Y;
            heroContent.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        };

        const onPointerLeave = () => {
            heroContent.style.transform = "";
        };

        hero.addEventListener("pointermove", onPointerMove, pointerListenerOptions);
        hero.addEventListener("pointerleave", onPointerLeave, pointerListenerOptions);
        registerMotionCleanup(() => hero.removeEventListener("pointermove", onPointerMove, pointerListenerOptions));
        registerMotionCleanup(() => hero.removeEventListener("pointerleave", onPointerLeave, pointerListenerOptions));
        registerMotionCleanup(() => {
            heroContent.style.transform = "";
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
        if (elements.hero) {
            elements.hero.style.removeProperty("--scroll-lift");
        }
    }

    function bindScrollSoft() {
        teardownScrollSoft();
        if (isReducedMotion()) {
            return;
        }

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
        if (isReducedMotion()) {
            revealAll();
            return;
        }

        if (!("IntersectionObserver" in window)) {
            revealAll();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("reveal-in");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN }
        );

        elements.revealTargets.forEach((target) => {
            observer.observe(target);
        });

        registerCleanup(() => observer.disconnect());
    }

    function applyReducedMotionState() {
        elements.body.classList.remove("anim-init");
        elements.body.classList.add("anim-in");
        revealAll();
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
