function setCatMode(cat, mode) {
    cat.dataset.mode = mode;
}

function setCatPosition(cat, x, y, duration = 2200, easing = "linear") {
    cat.style.transition = `transform ${duration}ms ${easing}`;
    cat.style.setProperty("--cat-x", `${Math.round(x)}px`);
    cat.style.setProperty("--cat-y", `${Math.round(y)}px`);
}

function setCatFacing(cat, faceRight) {
    cat.classList.toggle("is-flipped", !faceRight);
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function getCatRect(cat) {
    return cat ? cat.getBoundingClientRect() : null;
}

function getCurrentTransformPosition(cat) {
    const style = getComputedStyle(cat);
    const x = parseFloat(style.getPropertyValue("--cat-x")) || 0;
    const y = parseFloat(style.getPropertyValue("--cat-y")) || 0;
    return { x, y };
}

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

export function createOrangeCatApi() {
    const cat = document.getElementById("orangeCat");
    const stage = document.getElementById("catStage");

    if (!cat || !stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }

    stage.classList.remove("hidden");

    let hasSpawned = false;

    function isReady() {
        const content = document.getElementById("invitationContent");
        return !content || !content.classList.contains("hidden");
    }

    function getPosition() {
        return getCurrentTransformPosition(cat);
    }

    function getMode() {
        return cat.dataset.mode || "walk";
    }

    function getFacingRight() {
        return !cat.classList.contains("is-flipped");
    }

    async function moveTo({ mode, x, y, faceRight, duration = 2200, easing }) {
        const transitionEasing =
            easing ||
            (mode === "trot"
                ? "ease-in-out"
                : mode === "climb"
                    ? "ease-out"
                    : mode === "look" || mode === "sit" || mode === "loaf" || mode === "stretch"
                        ? "ease-out"
                        : "linear");

        setCatMode(cat, mode);
        setCatFacing(cat, faceRight);
        setCatPosition(cat, x, y, duration, transitionEasing);
        await wait(duration);
    }

    async function spawnAt({ x, y, faceRight = true, mode = "walk" }) {
        setCatMode(cat, mode);
        setCatFacing(cat, faceRight);
        setCatPosition(cat, x, y, 0, "linear");
        hasSpawned = true;
        await wait(0);
    }

    async function moveFromCurrentTo({
        mode = "walk",
        x,
        y,
        duration = 2200,
        easing
    }) {
        const current = getPosition();
        const faceRight = x >= current.x;
        await moveTo({
            mode,
            x,
            y,
            faceRight,
            duration,
            easing
        });
    }

    async function pause(ms) {
        await wait(ms);
    }

    function faceToward(clientX) {
        const rect = getCatRect(cat);
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        setCatFacing(cat, clientX >= centerX);
    }

    async function nudgeAway(direction) {
        const current = getPosition();
        const delta = direction === "right" ? 42 : -42;

        await moveTo({
            mode: "trot",
            x: current.x + delta,
            y: current.y,
            faceRight: direction === "right",
            duration: 380,
            easing: "ease-in-out"
        });

        await moveTo({
            mode: "sit",
            x: current.x + delta,
            y: current.y,
            faceRight: direction !== "right",
            duration: 180,
            easing: "ease-out"
        });
    }

    async function lookAround(ms = 1000) {
        const current = getPosition();
        const faceRight = getFacingRight();

        await moveTo({
            mode: "look",
            x: current.x,
            y: current.y,
            faceRight,
            duration: 180,
            easing: "ease-out"
        });

        await pause(ms);
    }

    async function loaf(ms = 1400) {
        const current = getPosition();
        const faceRight = getFacingRight();

        await moveTo({
            mode: "loaf",
            x: current.x,
            y: current.y,
            faceRight,
            duration: 220,
            easing: "ease-out"
        });

        await pause(ms);
    }

    async function stretch(ms = 900) {
        const current = getPosition();
        const faceRight = getFacingRight();

        await moveTo({
            mode: "stretch",
            x: current.x,
            y: current.y,
            faceRight,
            duration: 180,
            easing: "ease-out"
        });

        await pause(ms);
    }

    async function reactToPet() {
        const current = getPosition();
        const faceRight = getFacingRight();

        const reactions = [
            async () => {
                await moveTo({
                    mode: "scratch",
                    x: current.x,
                    y: current.y,
                    faceRight,
                    duration: 180,
                    easing: "ease-out"
                });
                await pause(700);
            },
            async () => {
                await moveTo({
                    mode: "sit",
                    x: current.x,
                    y: current.y,
                    faceRight: !faceRight,
                    duration: 180,
                    easing: "ease-out"
                });
                await pause(900);
            },
            async () => {
                await moveTo({
                    mode: "look",
                    x: current.x,
                    y: current.y,
                    faceRight,
                    duration: 180,
                    easing: "ease-out"
                });
                await pause(800);
            },
            async () => {
                await moveTo({
                    mode: "loaf",
                    x: current.x,
                    y: current.y,
                    faceRight,
                    duration: 220,
                    easing: "ease-out"
                });
                await pause(1200);
            }
        ];

        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        await reaction();
    }

    return {
        isReady,
        hasSpawned: () => hasSpawned,
        getElement: () => cat,
        getRect: () => getCatRect(cat),
        getMode,
        getFacingRight,
        getPosition,
        moveTo,
        moveFromCurrentTo,
        spawnAt,
        pause,
        faceToward,
        nudgeAway,
        lookAround,
        loaf,
        stretch,
        reactToPet
    };
}