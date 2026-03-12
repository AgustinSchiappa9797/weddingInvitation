const SECTION_KEYS = ["details", "access", "gallery", "rsvp", "playlist"];

function getTabMap(els) {
    return {
        details: els.tabDetails,
        access: els.tabAccess,
        gallery: els.tabGallery,
        rsvp: els.tabRsvp,
        playlist: els.tabPlaylist
    };
}

function getPanelMap(els) {
    return {
        details: els.panelDetails,
        access: els.panelAccess,
        gallery: els.panelGallery,
        rsvp: els.panelRsvp,
        playlist: els.panelPlaylist
    };
}

function getSectionAvailability(viewData) {
    return {
        details: true,
        access: true,
        gallery: Boolean(viewData?.hasGallery),
        rsvp: Boolean(viewData?.hasRsvp),
        playlist: Boolean(viewData?.hasPlaylist)
    };
}

function getFirstAvailableSection(availability) {
    return SECTION_KEYS.find((key) => availability[key]) || "details";
}

function getAvailabilityFromCurrentUi(els) {
    return {
        hasGallery: !els.tabGallery?.classList.contains("hidden"),
        hasRsvp: !els.tabRsvp?.classList.contains("hidden"),
        hasPlaylist: !els.tabPlaylist?.classList.contains("hidden")
    };
}

export function syncContentPanelVisibility(els, state, viewData) {
    const tabs = getTabMap(els);
    const panels = getPanelMap(els);
    const availability = getSectionAvailability(viewData);

    SECTION_KEYS.forEach((key) => {
        const isAvailable = availability[key];

        tabs[key]?.classList.toggle("hidden", !isAvailable);
        panels[key]?.classList.toggle("hidden", !isAvailable);
    });

    if (!availability[state.activeSection]) {
        state.setActiveSection(getFirstAvailableSection(availability));
    }

    renderActivePanel(els, state, viewData);
}

function syncHeartMode(els, activeSection) {
    if (!els.heartScene) return;

    els.heartScene.dataset.heartMode = activeSection || "details";

    const hotspotMap = {
        details: els.heartHotspotDetails,
        access: els.heartHotspotAccess,
        gallery: els.heartHotspotGallery,
        rsvp: els.heartHotspotRsvp,
        playlist: els.heartHotspotPlaylist
    };

    Object.entries(hotspotMap).forEach(([key, element]) => {
        const isActive = key === activeSection;
        element?.classList.toggle("is-active", isActive);
        element?.setAttribute("aria-pressed", String(isActive));
    });
}

export function renderActivePanel(els, state, viewData) {
    const tabs = getTabMap(els);
    const panels = getPanelMap(els);
    const availability = getSectionAvailability(viewData);

    if (!availability[state.activeSection]) {
        state.setActiveSection(getFirstAvailableSection(availability));
    }

    SECTION_KEYS.forEach((key) => {
        const isAvailable = availability[key];
        const isActive = isAvailable && state.activeSection === key;

        tabs[key]?.classList.toggle("is-active", isActive);
        tabs[key]?.setAttribute("aria-selected", String(isActive));
        tabs[key]?.setAttribute("tabindex", isActive ? "0" : "-1");

        panels[key]?.classList.toggle("is-active", isActive);
        panels[key]?.setAttribute("aria-hidden", String(!isActive));
    });

    syncHeartMode(els, state.activeSection);
}

export function setupContentPanelNavigation(els, state) {
    const tabs = getTabMap(els);

    SECTION_KEYS.forEach((key) => {
        tabs[key]?.addEventListener("click", () => {
            if (tabs[key]?.classList.contains("hidden")) {
                return;
            }

            state.setActiveSection(key);
            renderActivePanel(els, state, getAvailabilityFromCurrentUi(els));
        });
    });

    renderActivePanel(els, state, {
        hasGallery: true,
        hasRsvp: true,
        hasPlaylist: true
    });
}