import { COPY } from "../constants/copy.js";

function normalizeCompanions(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return 1;
    }

    return Math.floor(parsed);
}

function getCompanionsText(companions) {
    return companions === 1
        ? COPY.companions.single
        : COPY.companions.multiple(companions);
}

function normalizeGallery(gallery) {
    if (!Array.isArray(gallery)) return [];
    return gallery.filter((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeTimeline(timeline) {
    if (!Array.isArray(timeline)) return [];

    return timeline.filter(item =>
        item &&
        typeof item === "object" &&
        item.title &&
        item.time
    );
}

function getEventPhase(eventIsoDate) {
    const date = new Date(eventIsoDate);

    if (Number.isNaN(date.getTime())) {
        return "upcoming";
    }

    const diff = date.getTime() - Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff <= 0) return "started";
    if (diff <= oneDay) return "today";
    return "upcoming";
}

function getDaysUntil(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diff = date.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getInvitationViewData(data) {
    const companions = normalizeCompanions(data.companions);

    return {
        ...data,
        companions,
        companionsText: getCompanionsText(companions),
        gallery: normalizeGallery(data.gallery),
        rsvpDaysLeft: getDaysUntil(data.rsvpDeadlineIso || data.rsvpDeadline),
        timeline: normalizeTimeline(data.timeline),
        eventPhase: getEventPhase(data.eventIsoDate),
        hasTimeline: normalizeTimeline(data.timeline).length > 0,
        hasGallery: normalizeGallery(data.gallery).length > 0,
        hasCalendar: Boolean(data.eventIsoDate),
        hasPlaylist: typeof data.playlistUrl === "string" && data.playlistUrl.trim() !== "",
        hasMap: typeof data.mapUrl === "string" && data.mapUrl.trim() !== "",
        hasRsvp: typeof data.rsvpUrl === "string" && data.rsvpUrl.trim() !== ""
    };
}