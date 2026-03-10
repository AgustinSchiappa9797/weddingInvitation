import { setOptionalLink } from "../utils/links.js";
import { buildGoogleCalendarUrl } from "../utils/calendar.js";

function hasValidVisibleLink(element) {
    return element && !element.classList.contains("hidden") && element.getAttribute("href");
}

function setStickyLabels(els, data) {
    const eventDate = new Date(data.eventIsoDate);
    const isValidDate = !Number.isNaN(eventDate.getTime());
    const isEventDay = isValidDate && Math.abs(eventDate.getTime() - Date.now()) < 24 * 60 * 60 * 1000;

    if (els.stickyMapButton) {
        els.stickyMapButton.textContent = isEventDay ? "Llegar ahora" : "Cómo llegar";
    }

    if (els.stickyRsvpButton) {
        els.stickyRsvpButton.textContent = isEventDay ? "Confirmación" : "Confirmar";
    }
}

export function renderStickyBar(els, data) {
    if (!els.mobileStickyBar) return;

    setOptionalLink(els.stickyMapButton, data.mapUrl);
    setOptionalLink(els.stickyRsvpButton, data.rsvpUrl);
    setOptionalLink(els.stickyCalendarButton, buildGoogleCalendarUrl(data));

    setStickyLabels(els, data);

    const buttons = [
        els.stickyMapButton,
        els.stickyCalendarButton,
        els.stickyRsvpButton
    ].filter(hasValidVisibleLink);

    if (buttons.length === 0) {
        els.mobileStickyBar.classList.add("hidden");
        return;
    }

    els.mobileStickyBar.classList.remove("hidden");

    [els.stickyMapButton, els.stickyCalendarButton, els.stickyRsvpButton].forEach((button) => {
        if (!button) return;
        button.classList.remove("is-full");
    });

    if (buttons.length === 1) {
        buttons[0].classList.add("is-full");
    }
}