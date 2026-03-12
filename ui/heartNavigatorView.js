function getHeartHotspotMap(els) {
    return {
        details: els.heartHotspotDetails,
        access: els.heartHotspotAccess,
        gallery: els.heartHotspotGallery,
        rsvp: els.heartHotspotRsvp,
        playlist: els.heartHotspotPlaylist
    };
}

function getTabMap(els) {
    return {
        details: els.tabDetails,
        access: els.tabAccess,
        gallery: els.tabGallery,
        rsvp: els.tabRsvp,
        playlist: els.tabPlaylist
    };
}

export function syncHeartHotspots(els, activeSection) {
    const hotspots = getHeartHotspotMap(els);

    Object.entries(hotspots).forEach(([key, element]) => {
        const isActive = key === activeSection;
        element?.classList.toggle("is-active", isActive);
        element?.setAttribute("aria-pressed", String(isActive));
    });
}

export function syncHeartHotspotVisibility(els) {
    const hotspots = getHeartHotspotMap(els);
    const tabs = getTabMap(els);

    Object.keys(hotspots).forEach((key) => {
        const isHidden = tabs[key]?.classList.contains("hidden");
        hotspots[key]?.classList.toggle("hidden", Boolean(isHidden));
    });
}

export function setupHeartNavigator(els) {
    const hotspots = getHeartHotspotMap(els);
    const tabs = getTabMap(els);

    Object.keys(hotspots).forEach((key) => {
        hotspots[key]?.addEventListener("click", () => {
            const targetTab = tabs[key];

            if (!targetTab || targetTab.classList.contains("hidden")) {
                return;
            }

            targetTab.click();
        });
    });
}