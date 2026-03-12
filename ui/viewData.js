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
    const allImages = normalizeGallery(data.gallery);
    const backgroundImage = allImages[0] || "";
    const gallery = allImages.slice(1);
    const timeline = normalizeTimeline(data.timeline);
    const parkingInfo = normalizeInfoItems(pickFirstNonEmpty(data, ["parkingInfo", "parking", "estacionamiento"]));
    const entryInfo = normalizeInfoItems(pickFirstNonEmpty(data, ["entryInfo", "entry", "ingreso"]));
    const recommendations = normalizeInfoItems(pickFirstNonEmpty(data, ["recommendations", "recommendation", "recomendaciones"]));

    return {
        ...data,
        companions,
        companionsText: getCompanionsText(companions),
        gallery,
        backgroundImage,
        parkingInfo,
        entryInfo,
        recommendations,
        rsvpDaysLeft: getDaysUntil(data.rsvpDeadlineIso || data.rsvpDeadline),
        timeline,
        eventPhase: getEventPhase(data.eventIsoDate),
        hasTimeline: timeline.length > 0,
        hasGallery: gallery.length > 0,
        hasCalendar: Boolean(data.eventIsoDate),
        hasParkingInfo: parkingInfo.length > 0,
        hasEntryInfo: entryInfo.length > 0,
        hasRecommendations: recommendations.length > 0,
        hasPlaylist: typeof data.playlistUrl === "string" && data.playlistUrl.trim() !== "",
        hasMap: typeof data.mapUrl === "string" && data.mapUrl.trim() !== "",
        hasRsvp: typeof data.rsvpUrl === "string" && data.rsvpUrl.trim() !== ""
    };
}