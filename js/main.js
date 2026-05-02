// Anchor smooth scroll with guard checks to avoid invalid selector errors.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") {
            return;
        }

        const target = document.querySelector(href);
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/* Page entrance + scroll reveal (respects prefers-reduced-motion) */
(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function startEntrance() {
        if (reduceMotion) {
            document.body.classList.remove("anim-init");
            document.body.classList.add("anim-in");
            document.querySelectorAll(".reveal").forEach((el) => {
                el.classList.add("reveal-in");
            });
            return;
        }
        requestAnimationFrame(() => {
            document.body.classList.replace("anim-init", "anim-in");
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

    if (reduceMotion) {
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
            { threshold: 0.15 }
        );
        document.querySelectorAll(".footer.reveal, .reveal").forEach((el) => {
            io.observe(el);
        });
    } else {
        revealAll();
    }
})();
