import { setOptionalLink } from "../utils/links.js";
import { buildGoogleCalendarUrl } from "../utils/calendar.js";

export function renderDetails(els, data) {
    if (els.eventDateText) {
        els.eventDateText.textContent = data.eventDateText || "-";
    }

    if (els.eventTimeText) {
        els.eventTimeText.textContent = data.eventTimeText || "-";
    }

    if (els.venueName) {
        els.venueName.textContent = data.venueName || "-";
    }

    if (els.venueAddress) {
        els.venueAddress.textContent = data.venueAddress || "-";
    }

    setOptionalLink(els.mapButton, data.mapUrl);

    const calendarUrl = buildGoogleCalendarUrl(data);
    setOptionalLink(els.calendarButton, calendarUrl);
}