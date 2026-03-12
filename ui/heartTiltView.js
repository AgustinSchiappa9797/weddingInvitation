const MAX_ROTATE_X = 10;
const MAX_ROTATE_Y = 12;
const RESET_DELAY_MS = 40;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setHeartTilt(els, rotateX, rotateY) {
    if (!els.heartScene) return;

    els.heartScene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetHeartTilt(els) {
    if (!els.heartScene) return;

    els.heartScene.style.transform = "rotateX(0deg) rotateY(0deg)";
}

function handlePointerMove(els, clientX, clientY) {
    if (!els.heartScene) return;

    const rect = els.heartScene.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = (clientX - centerX) / (rect.width / 2);
    const offsetY = (clientY - centerY) / (rect.height / 2);

    const rotateY = clamp(offsetX * MAX_ROTATE_Y, -MAX_ROTATE_Y, MAX_ROTATE_Y);
    const rotateX = clamp(offsetY * -MAX_ROTATE_X, -MAX_ROTATE_X, MAX_ROTATE_X);

    setHeartTilt(els, rotateX, rotateY);
}

export function setupHeartTilt(els) {
    if (!els.heartScene) return;

    let touchResetTimeout = null;

    els.heartScene.addEventListener("mousemove", (event) => {
        handlePointerMove(els, event.clientX, event.clientY);
    });

    els.heartScene.addEventListener("mouseleave", () => {
        resetHeartTilt(els);
    });

    els.heartScene.addEventListener("touchstart", (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;

        if (touchResetTimeout) {
            clearTimeout(touchResetTimeout);
            touchResetTimeout = null;
        }

        handlePointerMove(els, touch.clientX, touch.clientY);
    }, { passive: true });

    els.heartScene.addEventListener("touchmove", (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;

        handlePointerMove(els, touch.clientX, touch.clientY);
    }, { passive: true });

    els.heartScene.addEventListener("touchend", () => {
        if (touchResetTimeout) {
            clearTimeout(touchResetTimeout);
        }

        touchResetTimeout = setTimeout(() => {
            resetHeartTilt(els);
        }, RESET_DELAY_MS);
    }, { passive: true });

    els.heartScene.addEventListener("touchcancel", () => {
        resetHeartTilt(els);
    }, { passive: true });
}