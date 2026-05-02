// Anchor smooth scroll with guard checks to avoid invalid selector errors.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (!target) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: prefersReduce ? "auto" : "smooth", block: "start" });
    });
});

/* Page entrance + scroll reveal (respects prefers-reduced-motion) */
(function () {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const staggerGapMs = 90;
    const listeners = [];

    function isReduceMotion() {
        return motionQuery.matches;
    }

    function isCoarsePointer() {
        return coarsePointerQuery.matches;
    }

    function applyStaggerVars() {
        document.querySelectorAll(".social-icons a").forEach((el, idx) => {
            el.style.setProperty("--stagger-delay", `${idx * staggerGapMs}ms`);
        });

        document.querySelectorAll(".reveal").forEach((el, idx) => {
            el.style.setProperty("--reveal-delay", `${idx * 70}ms`);
        });
    }

    function setupAdvancedMotion() {
        if (isReduceMotion() || isCoarsePointer()) {
            return;
        }

        const hero = document.querySelector(".hero");
        const heroContent = document.querySelector(".hero-content");
        if (hero && heroContent) {
            const onHeroMove = (e) => {
                const rect = hero.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width - 0.5;
                const relY = (e.clientY - rect.top) / rect.height - 0.5;
                const x = relX * 14;
                const y = relY * 10;
                heroContent.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            };

            const onHeroLeave = () => {
                heroContent.style.transform = "translate3d(0, 0, 0)";
            };

            hero.addEventListener("pointermove", onHeroMove);
            hero.addEventListener("pointerleave", onHeroLeave);
            listeners.push(() => hero.removeEventListener("pointermove", onHeroMove));
            listeners.push(() => hero.removeEventListener("pointerleave", onHeroLeave));
        }

        const magneticNodes = document.querySelectorAll(".social-icons a, .resume-btn");
        magneticNodes.forEach((node) => {
            node.classList.add("magnetic-hover");
            const onNodeMove = (e) => {
                const rect = node.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                node.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
            };
            const onNodeLeave = () => {
                node.style.transform = "";
            };
            node.addEventListener("pointermove", onNodeMove);
            node.addEventListener("pointerleave", onNodeLeave);
            listeners.push(() => node.removeEventListener("pointermove", onNodeMove));
            listeners.push(() => node.removeEventListener("pointerleave", onNodeLeave));
        });
    }

    function teardownAdvancedMotion() {
        while (listeners.length) {
            const off = listeners.pop();
            if (typeof off === "function") {
                off();
            }
        }

        const heroContent = document.querySelector(".hero-content");
        if (heroContent) {
            heroContent.style.transform = "";
        }

        document.querySelectorAll(".social-icons a, .resume-btn").forEach((node) => {
            node.classList.remove("magnetic-hover");
            node.style.transform = "";
        });
    }

    function applyAdaptiveMode() {
        const title = document.querySelector(".hero-title");
        if (title) {
            title.classList.remove("is-breathing");
            if (!isReduceMotion()) {
                title.classList.add("is-breathing");
            }
        }

        teardownAdvancedMotion();
        setupAdvancedMotion();
    }

    function applyReducedMotionState() {
        document.body.classList.remove("anim-init");
        document.body.classList.add("anim-in");
        document.querySelectorAll(".reveal").forEach((el) => {
            el.classList.add("reveal-in");
        });
    }

    function startEntrance() {
        if (isReduceMotion()) {
            applyReducedMotionState();
            return;
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove("anim-init");
                document.body.classList.add("anim-in");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startEntrance);
    } else {
        startEntrance();
    }

    applyStaggerVars();
    applyAdaptiveMode();

    function revealAll() {
        document.querySelectorAll(".reveal").forEach((el) => {
            el.classList.add("reveal-in");
        });
    }

    function onMotionPreferenceChange() {
        if (isReduceMotion()) {
            applyReducedMotionState();
        }
        applyAdaptiveMode();
    }

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", onMotionPreferenceChange);
    } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(onMotionPreferenceChange);
    }

    if (typeof coarsePointerQuery.addEventListener === "function") {
        coarsePointerQuery.addEventListener("change", applyAdaptiveMode);
    } else if (typeof coarsePointerQuery.addListener === "function") {
        coarsePointerQuery.addListener(applyAdaptiveMode);
    }

    if (isReduceMotion()) {
        return;
    }

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("reveal-in");
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px 48px 0px" }
        );
        document.querySelectorAll(".reveal").forEach((el) => {
            io.observe(el);
        });
    } else {
        revealAll();
    }
})();
