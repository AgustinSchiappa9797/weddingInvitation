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

function normalizeExistingConfirmation(value) {
    if (!value || typeof value !== "object") return null;

    const status = value.status === "no" ? "no" : value.status === "yes" ? "yes" : null;
    if (!status) return null;

    const attendingCount = Number.isFinite(Number(value.attendingCount))
        ? Math.max(0, Math.floor(Number(value.attendingCount)))
        : 0;

    return {
        status,
        attendingCount,
        dietaryRestrictions: typeof value.dietaryRestrictions === "string"
            ? value.dietaryRestrictions
            : "",
        comment: typeof value.comment === "string"
            ? value.comment
            : "",
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : ""
    };
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
    const coverImage =
        typeof data.coverImage === "string" && data.coverImage.trim() !== ""
            ? data.coverImage
            : rawGallery[0] || "";

    const gallery = rawGallery;
    const timeline = normalizeTimeline(data.timeline);
    const existingConfirmation = normalizeExistingConfirmation(data.existingConfirmation);

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
        backgroundImage: coverImage,
        gallery,
        timeline,
        existingConfirmation,
        hasExistingConfirmation: Boolean(existingConfirmation),
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