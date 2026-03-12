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

function getCurrentUiAvailability(els) {
    return getSectionAvailability({
        hasGallery: !els.tabGallery?.classList.contains("hidden"),
        hasRsvp: !els.tabRsvp?.classList.contains("hidden"),
        hasPlaylist: !els.tabPlaylist?.classList.contains("hidden")
    });
}

function getFirstAvailableSection(availability) {
    return SECTION_KEYS.find((key) => availability[key]) || "details";
}

function getVisibleSections(els) {
    const tabs = getTabMap(els);
    return SECTION_KEYS.filter((key) => !tabs[key]?.classList.contains("hidden"));
}

function focusContentPanel(els) {
    els.contentPanel?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    });
}

function applyActiveState(els, state, availability) {
    const tabs = getTabMap(els);
    const panels = getPanelMap(els);

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
        panels[key]?.setAttribute("tabindex", isActive ? "0" : "-1");
    });
}

export function syncNavigationVisibility(els, state, viewData) {
    const tabs = getTabMap(els);
    const panels = getPanelMap(els);
    const availability = getSectionAvailability(viewData);

    SECTION_KEYS.forEach((key) => {
        const isAvailable = availability[key];
        tabs[key]?.classList.toggle("hidden", !isAvailable);
        panels[key]?.classList.toggle("hidden", !isAvailable);
    });

    applyActiveState(els, state, availability);
}

export function renderActiveNavigation(els, state, viewData) {
    applyActiveState(els, state, getSectionAvailability(viewData));
}

export function goToSection(els, state, sectionKey, options = {}) {
    const availability = getCurrentUiAvailability(els);
    if (!availability[sectionKey]) return false;

    state.setActiveSection(sectionKey);
    applyActiveState(els, state, availability);

    if (options.focusPanel !== false) {
        focusContentPanel(els);
    }

    return true;
}

export function setupNavigation(els, state) {
    const tabs = getTabMap(els);

    SECTION_KEYS.forEach((key) => {
        tabs[key]?.addEventListener("click", () => {
            goToSection(els, state, key);
        });
    });

    els.sectionNav?.addEventListener("keydown", (event) => {
        const visibleSections = getVisibleSections(els);
        if (!visibleSections.length) return;

        const currentIndex = visibleSections.indexOf(state.activeSection);
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = currentIndex >= 0 ? (currentIndex + 1) % visibleSections.length : 0;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = currentIndex >= 0 ? (currentIndex - 1 + visibleSections.length) % visibleSections.length : 0;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = visibleSections.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        const nextSection = visibleSections[nextIndex];
        goToSection(els, state, nextSection, { focusPanel: false });
        tabs[nextSection]?.focus();
    });

    applyActiveState(els, state, getSectionAvailability({
        hasGallery: true,
        hasRsvp: true,
        hasPlaylist: true
    }));
}