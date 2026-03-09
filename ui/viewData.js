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

export function getInvitationViewData(data) {
    const companions = normalizeCompanions(data.companions);

    return {
        ...data,
        companions,
        companionsText: getCompanionsText(companions),
        gallery: normalizeGallery(data.gallery),
        hasPlaylist: typeof data.playlistUrl === "string" && data.playlistUrl.trim() !== "",
        hasMap: typeof data.mapUrl === "string" && data.mapUrl.trim() !== "",
        hasRsvp: typeof data.rsvpUrl === "string" && data.rsvpUrl.trim() !== ""
    };
}