import { COPY } from "../constants/copy.js";

function normalizeCompanions(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
    }

    return Math.floor(parsed);
}

function getCompanionsText(companions) {
    if (companions <= 1) {
        return COPY.companions.single;
    }

    return COPY.companions.multiple(companions);
}

function normalizeGallery(gallery) {
    if (!Array.isArray(gallery)) return [];
    return gallery.filter((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeTimeline(timeline) {
    if (!Array.isArray(timeline)) return [];

    return timeline.filter((item) =>
        item &&
        typeof item === "object" &&
        item.title &&
        item.time
    );
}

function normalizeInfoItems(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => typeof item === "string" ? item.trim() : "")
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function pickFirstNonEmpty(data, keys) {
    for (const key of keys) {
        const value = data?.[key];
        if (Array.isArray(value) && value.length) return value;
        if (typeof value === "string" && value.trim() !== "") return value;
    }

    return "";
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
    const rawGallery = normalizeGallery(data.gallery);
    const backgroundImage = rawGallery[0] || "";
    const gallery = rawGallery.slice(1);
    const timeline = normalizeTimeline(data.timeline);

    const confirmationDeadlineIso =
        data.confirmationDeadlineIso ||
        data.rsvpDeadlineIso ||
        data.rsvpDeadline ||
        "";

    const confirmationDeadlineText =
        data.confirmationDeadlineText ||
        data.rsvpDeadlineText ||
        "";

    const confirmationUrl =
        data.confirmationUrl ||
        data.rsvpUrl ||
        "";

    return {
        ...data,
        companions,
        companionsText: getCompanionsText(companions),
        backgroundImage,
        gallery,
        timeline,
        confirmationDeadlineIso,
        confirmationDeadlineText,
        confirmationUrl,
        confirmationDaysLeft: getDaysUntil(confirmationDeadlineIso),
        eventPhase: getEventPhase(data.eventIsoDate),
        hasTimeline: timeline.length > 0,
        hasGallery: gallery.length > 0,
        hasCalendar: Boolean(data.eventIsoDate),
        hasPlaylist: typeof data.playlistUrl === "string" && data.playlistUrl.trim() !== "",
        hasMap: typeof data.mapUrl === "string" && data.mapUrl.trim() !== "",
        hasConfirmation: true
    };
}