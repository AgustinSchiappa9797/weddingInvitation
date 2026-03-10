import { setOptionalLink } from "../utils/links.js";

function hasValidVisibleLink(element) {
    return element && !element.classList.contains("hidden") && element.getAttribute("href") !== "#";
}

export function renderStickyBar(els, data) {
    if (!els.mobileStickyBar) return;

    setOptionalLink(els.stickyMapButton, data.mapUrl);
    setOptionalLink(els.stickyRsvpButton, data.rsvpUrl);

    const hasMap = hasValidVisibleLink(els.stickyMapButton);
    const hasRsvp = hasValidVisibleLink(els.stickyRsvpButton);

    if (!hasMap && !hasRsvp) {
        els.mobileStickyBar.classList.add("hidden");
        return;
    }

    els.mobileStickyBar.classList.remove("hidden");

    if (!hasMap && els.stickyRsvpButton) {
        els.stickyRsvpButton.classList.add("is-full");
    } else if (els.stickyRsvpButton) {
        els.stickyRsvpButton.classList.remove("is-full");
    }

    if (!hasRsvp && els.stickyMapButton) {
        els.stickyMapButton.classList.add("is-full");
    } else if (els.stickyMapButton) {
        els.stickyMapButton.classList.remove("is-full");
    }
}