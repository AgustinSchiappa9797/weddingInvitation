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

export function renderActivePanel(els, state) {
    const tabs = getTabMap(els);
    const panels = getPanelMap(els);

    SECTION_KEYS.forEach((key) => {
        const isActive = state.activeSection === key;

        tabs[key]?.classList.toggle("is-active", isActive);
        panels[key]?.classList.toggle("is-active", isActive);
    });
}

export function setupContentPanelNavigation(els, state) {
    const tabs = getTabMap(els);

    SECTION_KEYS.forEach((key) => {
        tabs[key]?.addEventListener("click", () => {
            state.setActiveSection(key);
            renderActivePanel(els, state);
        });
    });

    renderActivePanel(els, state);
}