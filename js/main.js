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

    function isReduceMotion() {
        return motionQuery.matches;
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

    function revealAll() {
        document.querySelectorAll(".reveal").forEach((el) => {
            el.classList.add("reveal-in");
        });
    }

    function onMotionPreferenceChange() {
        if (isReduceMotion()) {
            applyReducedMotionState();
        }
    }

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", onMotionPreferenceChange);
    } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(onMotionPreferenceChange);
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
