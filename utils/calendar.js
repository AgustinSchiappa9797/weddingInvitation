import { DEFAULT_EVENT_DURATION_MS } from "../config.js";

function pad(value) {
    return String(value).padStart(2, "0");
}

function toGoogleDate(date) {
    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate())
    ].join("") + "T" + [
        pad(date.getUTCHours()),
        pad(date.getUTCMinutes()),
        pad(date.getUTCSeconds())
    ].join("") + "Z";
}

function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

export function buildGoogleCalendarUrl(data) {
    if (!data || !data.eventIsoDate) return null;

    const startDate = new Date(data.eventIsoDate);
    if (!isValidDate(startDate)) return null;

    const endDate = new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MS);

    const title = data.heroTitle || data.mainTitle || "Evento";
    const location = [data.venueName, data.venueAddress].filter(Boolean).join(", ");
    const details = data.heroSubtitle || "Te esperamos para compartir este momento especial.";

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toGoogleDate(startDate)}/${toGoogleDate(endDate)}`,
        details,
        location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}