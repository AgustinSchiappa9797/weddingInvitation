function isMobileViewport() {
    return window.matchMedia?.("(max-width: 720px)")?.matches
        ?? window.innerWidth <= 720;
}

function syncFloatingUiState(els) {
    const stickyVisible = Boolean(
        els.mobileStickyRsvp &&
        !els.mobileStickyRsvp.classList.contains("hidden") &&
        !els.mobileStickyRsvp.classList.contains("is-contextually-hidden")
    );

    document.body.classList.toggle("has-sticky-rsvp", stickyVisible);
}

function syncSectionNavMode(els, state) {
    const isMobile = isMobileViewport();
    const activeSection =
        document.body.dataset.activeSection ||
        state.activeSection ||
        "details";

    const navRect = els.sectionNav?.getBoundingClientRect?.();
    const panelRect = els.contentPanel?.getBoundingClientRect?.();

    const hasPanelInView = Boolean(
        navRect &&
        panelRect &&
        navRect.top <= 18 &&
        panelRect.top < window.innerHeight * 0.55 &&
        panelRect.bottom > 180
    );

    const hasKnownPanel = Boolean(
        activeSection &&
        activeSection !== "hero"
    );

    const useHorizontalMobileNav =
        isMobile &&
        hasKnownPanel &&
        hasPanelInView;

    document.body.classList.toggle(
        "is-mobile-panel-nav",
        useHorizontalMobileNav
    );
}

export function setupViewportController(els, state) {
    if (!els || !state) return;

    let animationFrameId = null;

    const scheduleSectionNavSync = () => {
        if (animationFrameId !== null) {
            return;
        }

        animationFrameId = requestAnimationFrame(() => {
            animationFrameId = null;
            syncSectionNavMode(els, state);
        });
    };

    const syncViewportState = () => {
        document.body.classList.toggle(
            "is-mobile-experience",
            isMobileViewport()
        );

        syncFloatingUiState(els);
        syncSectionNavMode(els, state);
    };

    window.addEventListener("resize", () => {
        syncViewportState();
    });

    window.addEventListener(
        "scroll",
        scheduleSectionNavSync,
        { passive: true }
    );

    window.addEventListener(
        "orientationchange",
        syncViewportState
    );

    window.addEventListener(
        "invitation:mobilefloatingui",
        () => syncFloatingUiState(els)
    );

    window.addEventListener(
        "invitation:sectionchange",
        scheduleSectionNavSync
    );

    syncViewportState();
}