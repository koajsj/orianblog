(() => {
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

    function registerCleanup(callback) {
        cleanupTasks.push(callback);
    }

    function runCleanup() {
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

    function setRevealDelays() {
        elements.magneticTargets.forEach((target, index) => {
            target.style.setProperty("--stagger-delay", `${index * 90}ms`);
        });

        elements.revealTargets.forEach((target, index) => {
            target.style.setProperty("--reveal-delay", `${index * 70}ms`);
        });
    }

    function bindAnchorScrolling() {
        elements.anchors.forEach((anchor) => {
            const onClick = (event) => {
                const href = anchor.getAttribute("href");
                if (!href || href === "#") {
                    event.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
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

    function bindHeroParallax() {
        if (!elements.hero || !elements.heroContent || isReducedMotion() || isCoarsePointer()) {
            return;
        }

        const onPointerMove = (event) => {
            const rect = elements.hero.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
            const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
            const offsetX = relativeX * 14;
            const offsetY = relativeY * 10;
            elements.heroContent.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        };

        const onPointerLeave = () => {
            elements.heroContent.style.transform = "";
        };

        elements.hero.addEventListener("pointermove", onPointerMove);
        elements.hero.addEventListener("pointerleave", onPointerLeave);
        registerCleanup(() => elements.hero.removeEventListener("pointermove", onPointerMove));
        registerCleanup(() => elements.hero.removeEventListener("pointerleave", onPointerLeave));
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
                target.style.transform = `translate3d(${offsetX * 0.12}px, ${offsetY * 0.12}px, 0)`;
            };

            const onPointerLeave = () => {
                target.style.transform = "";
            };

            target.addEventListener("pointermove", onPointerMove);
            target.addEventListener("pointerleave", onPointerLeave);
            registerCleanup(() => target.removeEventListener("pointermove", onPointerMove));
            registerCleanup(() => target.removeEventListener("pointerleave", onPointerLeave));
            registerCleanup(() => {
                target.classList.remove("magnetic-hover");
                target.style.transform = "";
            });
        });
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
            { threshold: 0.08, rootMargin: "0px 0px 48px 0px" }
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
            if (isReducedMotion()) {
                applyReducedMotionState();
            }
            syncMotionMode();
        };

        const onPageHide = () => {
            runCleanup();
        };

        if (typeof motionMedia.addEventListener === "function") {
            motionMedia.addEventListener("change", onMotionChange);
            registerCleanup(() => motionMedia.removeEventListener("change", onMotionChange));
        } else if (typeof motionMedia.addListener === "function") {
            motionMedia.addListener(onMotionChange);
            registerCleanup(() => motionMedia.removeListener(onMotionChange));
        }

        window.addEventListener("pagehide", onPageHide, { once: true });
    }

    function init() {
        setRevealDelays();
        bindAnchorScrolling();
        bindHeroParallax();
        bindMagneticTargets();
        bindRevealObserver();
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
