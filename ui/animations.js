export function setupAnimations() {
    const elements = document.querySelectorAll(".fade-up");

    if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => el.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
}

export function revealContentAnimations() {
    requestAnimationFrame(() => {
        document.querySelectorAll("#invitationContent .fade-up").forEach((el) => {
            el.classList.add("visible");
        });
    });
}