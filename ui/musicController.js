const STORAGE_KEY = "weddingInvitation:bgMusicPreference";
const DEFAULT_VOLUME = 0.22;
const FADE_MS = 900;
const AUTOPLAY_EVENTS = ["pointerdown", "touchstart", "keydown"];
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function supportsStorage() {
    try {
        return typeof window !== "undefined" && Boolean(window.localStorage);
    } catch {
        return false;
    }
}

function loadPreference() {
    if (!supportsStorage()) return "on";
    return window.localStorage.getItem(STORAGE_KEY) || "on";
}

function savePreference(value) {
    if (!supportsStorage()) return;
    window.localStorage.setItem(STORAGE_KEY, value);
}

function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches;
}

function setStatusText(els, text = "") {
    if (els.musicToggleStatus) {
        els.musicToggleStatus.textContent = text;
    }
}

function isMobileViewport() {
    return window.matchMedia?.("(max-width: 720px)")?.matches ?? window.innerWidth <= 720;
}

function updateButtonState(els, state) {
    if (!els.musicToggle || !els.musicToggleText) return;

    const isPlaying = state === "playing";
    const isPending = state === "pending";

    els.musicToggle.classList.toggle("is-active", isPlaying);
    els.musicToggle.classList.toggle("is-pending", isPending);
    els.musicToggle.setAttribute("aria-pressed", String(isPlaying));
    els.musicToggle.setAttribute(
        "aria-label",
        isPlaying ? "Apagar música de fondo" : "Activar música de fondo"
    );

    if (els.musicToggleHint) {
        els.musicToggleHint.textContent = isPlaying
            ? "Podés apagarla cuando quieras"
            : isPending
                ? "Se activará al tocar la invitación"
                : "Sonido suave de fondo";
    }

    els.musicToggleText.textContent = isPlaying ? "Apagar música" : "Activar música";
    setStatusText(els, isPlaying ? "La música está sonando." : isPending ? "La música se activará al tocar la invitación." : "La música está apagada.");

    document.body.classList.toggle("music-enabled", isPlaying);
    document.body.classList.toggle("music-pending", isPending);
    document.body.dataset.musicState = isPlaying ? "playing" : isPending ? "pending" : "idle";
    document.body.classList.toggle("music-idle-mobile", isMobileViewport() && !isPlaying && !isPending);
}

async function playSafely(audio) {
    const result = audio.play();
    if (result && typeof result.then === "function") {
        await result;
    }
}

function fadeVolume(audio, from, to, duration = FADE_MS) {
    if (!audio) return Promise.resolve();

    if (prefersReducedMotion()) {
        audio.volume = Math.max(0, Math.min(1, to));
        return Promise.resolve();
    }

    if (audio.__fadeFrame) {
        cancelAnimationFrame(audio.__fadeFrame);
        audio.__fadeFrame = null;
    }

    const start = performance.now();
    audio.volume = Math.max(0, Math.min(1, from));

    return new Promise((resolve) => {
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            audio.volume = from + ((to - from) * eased);

            if (progress < 1) {
                audio.__fadeFrame = requestAnimationFrame(step);
                return;
            }

            audio.__fadeFrame = null;
            audio.volume = Math.max(0, Math.min(1, to));
            resolve();
        };

        audio.__fadeFrame = requestAnimationFrame(step);
    });
}

function hasPlayableSource(audio) {
    if (!audio) return false;

    if (audio.currentSrc) return true;

    const source = audio.querySelector("source");
    return Boolean(source?.getAttribute("src")?.trim());
}

export function initMusic(els) {
    const audio = els.bgMusic;
    const button = els.musicToggle;

    if (!audio || !button || !hasPlayableSource(audio)) {
        button?.classList.add("hidden");
        button?.setAttribute("hidden", "hidden");
        return;
    }

    button.hidden = false;
    button.removeAttribute("hidden");

    audio.preload = "metadata";
    audio.playsInline = true;

    let preference = loadPreference();
    let playbackIntent = preference !== "off";
    let pendingAutoplay = false;
    let autoplayHandler = null;
    let currentAction = null;

    const syncState = () => {
        button.disabled = false;
        if (!audio.paused) {
            updateButtonState(els, "playing");
            syncMobileVisibility();
            return;
        }

        updateButtonState(els, pendingAutoplay ? "pending" : "idle");
        syncMobileVisibility();
    };

    const removeAutoplayListeners = () => {
        if (!autoplayHandler) return;
        AUTOPLAY_EVENTS.forEach((eventName) => {
            document.removeEventListener(eventName, autoplayHandler, true);
        });
        autoplayHandler = null;
    };

    const runExclusive = async (task) => {
        const previousTask = currentAction;
        if (previousTask) {
            try {
                await previousTask;
            } catch {
                // noop
            }
        }

        const nextTask = Promise.resolve().then(task);
        currentAction = nextTask;

        try {
            await nextTask;
        } finally {
            if (currentAction === nextTask) {
                currentAction = null;
            }
        }
    };

    const scheduleAutoplayOnInteraction = () => {
        removeAutoplayListeners();

        if (!playbackIntent) {
            pendingAutoplay = false;
            syncState();
            return;
        }

        pendingAutoplay = true;
        syncState();

        autoplayHandler = (event) => {
            if (event?.target instanceof Element && button.contains(event.target)) {
                return;
            }

            removeAutoplayListeners();

            runExclusive(async () => {
                if (!playbackIntent || !audio.paused) {
                    pendingAutoplay = false;
                    syncState();
                    return;
                }

                try {
                    audio.volume = 0.02;
                    await playSafely(audio);
                    pendingAutoplay = false;
                    await fadeVolume(audio, Math.max(audio.volume, 0.02), DEFAULT_VOLUME);
                    syncState();
                } catch (error) {
                    console.warn("No se pudo iniciar la música tras la interacción:", error);
                    pendingAutoplay = false;
                    syncState();
                }
            });
        };

        AUTOPLAY_EVENTS.forEach((eventName) => {
            document.addEventListener(eventName, autoplayHandler, { once: true, capture: true, passive: true });
        });
    };

    const startPlayback = async ({ manual = false } = {}) => {
        button.disabled = true;
        playbackIntent = true;
        preference = "on";
        savePreference(preference);
        removeAutoplayListeners();
        pendingAutoplay = false;

        try {
            if (audio.readyState < 2) {
                audio.load();
            }

            audio.volume = manual ? Math.max(audio.volume, 0.02) : 0.02;
            await playSafely(audio);
            await fadeVolume(audio, Math.max(audio.volume, 0.02), DEFAULT_VOLUME);
            syncState();
        } catch (error) {
            console.warn("No se pudo iniciar la música:", error);
            scheduleAutoplayOnInteraction();
        }
    };

    const stopPlayback = async () => {
        button.disabled = true;
        playbackIntent = false;
        preference = "off";
        savePreference(preference);
        removeAutoplayListeners();
        pendingAutoplay = false;

        if (!audio.paused) {
            const currentVolume = Number.isFinite(audio.volume) ? audio.volume : DEFAULT_VOLUME;
            await fadeVolume(audio, currentVolume, 0, 320);
            audio.pause();
        }

        audio.volume = DEFAULT_VOLUME;
        syncState();
    };

    button.addEventListener("click", () => {
        if (button.disabled) return;
        button.blur();
        removeAutoplayListeners();
        pendingAutoplay = false;

        runExclusive(async () => {
            if (!audio.paused) {
                await stopPlayback();
                return;
            }

            await startPlayback({ manual: true });
        });
    });

    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);
    audio.addEventListener("ended", syncState);
    audio.addEventListener("error", () => {
        pendingAutoplay = false;
        button.disabled = true;
        button.classList.add("is-disabled");
        setStatusText(els, "No pudimos cargar la música de fondo.");
        updateButtonState(els, "idle");
    });

    const syncMobileVisibility = () => {
        const isMobile = isMobileViewport();
        const shouldCompact = isMobile && audio.paused && !pendingAutoplay;
        button.classList.toggle("is-mobile-idle", shouldCompact);
    };

    audio.addEventListener("canplay", () => {
        button.classList.remove("is-disabled");
        button.disabled = false;
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && playbackIntent && audio.paused) {
            scheduleAutoplayOnInteraction();
        }
    });

    window.addEventListener("resize", syncMobileVisibility);

    syncState();
    syncMobileVisibility();

    if (playbackIntent) {
        runExclusive(() => startPlayback());
    }
}
