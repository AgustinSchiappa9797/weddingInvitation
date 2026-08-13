const SECTION_PROGRESS = {
    details: 0.00,
    access: 0.20,
    gallery: 0.42,
    rsvp: 0.62,
    playlist: 0.82,
    gift: 1.00
};

const DEFAULT_PROGRESS = 0;
const TRANSITION_DURATION_MS = 900;

let animationFrameId = null;
let currentProgress = DEFAULT_PROGRESS;

function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
}

function getProgressForSection(section) {
    return SECTION_PROGRESS[section] ?? DEFAULT_PROGRESS;
}

function readSceneProgress() {
    const rawValue = Number.parseFloat(
        document.documentElement.style.getPropertyValue("--scene-progress")
    );

    return Number.isFinite(rawValue) ? clamp(rawValue) : currentProgress;
}

function setSceneProgress(progress) {
    currentProgress = clamp(progress);

    document.documentElement.style.setProperty(
        "--scene-progress",
        currentProgress.toFixed(4)
    );

    document.body.dataset.sceneProgress = currentProgress.toFixed(2);
}

function animateProgress(to, duration = TRANSITION_DURATION_MS) {
    const from = readSceneProgress();

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        setSceneProgress(to);
        return;
    }

    const target = clamp(to);

    if (Math.abs(from - target) < 0.0001) {
        setSceneProgress(target);
        return;
    }

    const start = performance.now();

    const step = (now) => {
        const elapsed = now - start;
        const linearProgress = Math.min(1, elapsed / duration);

        const eased = linearProgress < 0.5
            ? 2 * linearProgress * linearProgress
            : 1 - Math.pow(-2 * linearProgress + 2, 2) / 2;

        setSceneProgress(from + ((target - from) * eased));

        if (linearProgress < 1) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            animationFrameId = null;
            setSceneProgress(target);
        }
    };

    animationFrameId = requestAnimationFrame(step);
}

export function setupSceneController() {
    const initialSection = document.body.dataset.activeSection || "details";

    setSceneProgress(getProgressForSection(initialSection));

    window.addEventListener("invitation:sectionchange", (event) => {
        const section = event.detail?.section;
        animateProgress(getProgressForSection(section));
    });
}
