import { COPY } from "../constants/copy.js";

function normalizeCompanions(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
    }

    return Math.floor(parsed);
}

function getGuestGrammarContext(data, companions) {
    const isPlural = companions > 1;

    return {
        isPlural,
        isSingular: !isPlural,
        kidsAllowed: Boolean(data.kidsAllowed),
        companions
    };
}

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getCompanionsText(companions) {
    if (companions <= 1) {
        return COPY.companions.single;
    }

    return COPY.companions.multiple(companions);
}

function buildHeroEyebrow(data) {
    const custom = normalizeText(data.heroEyebrow);
    if (custom) return custom;

    if (normalizeText(data.eventDateText)) {
        return "Reservá este día";
    }

    return COPY.defaults.heroEyebrow;
}

function buildHeroIntro(data, grammar) {
    const custom = normalizeText(data.heroIntro);
    if (custom) return custom;

    return COPY.defaults.heroIntro(grammar);
}

function buildWelcomeTitle(data) {
    const name = normalizeText(data.guestName);
    if (name) {
        return name;
    }

    return COPY.ready.guestFallback;
}

function buildDynamicCopy(data, companions) {
    const grammar = getGuestGrammarContext(data, companions);

    return {
        grammar,
        heroEyebrow: buildHeroEyebrow(data),
        heroSubtitle: normalizeText(data.heroText) || COPY.defaults.heroSubtitle(grammar),
        heroIntro: buildHeroIntro(data, grammar),
        companionsText: getCompanionsText(companions),
        kidsTag: data.kidsAllowed
            ? COPY.tags.kidsAllowed(grammar)
            : COPY.tags.adultsOnly,

        rsvpIntro: COPY.rsvp.intro(grammar),
        rsvpLegend: COPY.rsvp.legend(grammar),
        rsvpYesTitle: COPY.rsvp.yesOptionTitle(grammar),
        rsvpYesHint: COPY.rsvp.yesOptionHint(grammar),
        rsvpNoTitle: COPY.rsvp.noOptionTitle(grammar),
        rsvpNoHint: COPY.rsvp.noOptionHint(grammar),
        rsvpCountLabel: COPY.rsvp.countLabel(grammar),
        rsvpGuestNamesLabel: COPY.rsvp.guestNamesLabel(grammar),
        rsvpGuestNamesHelper: COPY.rsvp.guestNamesHelper(grammar),
        rsvpDietaryLabel: COPY.rsvp.dietaryLabel(grammar),
        rsvpDietaryPlaceholder: COPY.rsvp.dietaryPlaceholder(grammar),
        rsvpCommentLabel: COPY.rsvp.commentLabel(grammar),
        rsvpCommentPlaceholder: COPY.rsvp.commentPlaceholder(grammar),

        detailsKicker: COPY.details.kicker,
        detailsTitle: COPY.details.title,
        detailsIntro: COPY.details.intro(grammar),
        detailsScheduleKicker: COPY.details.scheduleKicker,
        detailsScheduleTitle: COPY.details.scheduleTitle,
        detailsLocationCardTitle: COPY.details.locationCardTitle,
        detailsLocationFallback: COPY.details.locationFallback,
        accessKicker: COPY.access.kicker,
        accessTitle: COPY.access.title,
        accessIntro: COPY.access.intro(grammar),
        accessVenueKicker: COPY.access.venueKicker,
        accessMapButtonLabel: COPY.access.mapButton,
        accessCopyAddressButtonLabel: COPY.access.copyAddressButton,
        accessRouteHint: COPY.access.routeHint,
        accessQuickFactsTitle: COPY.access.quickFactsTitle,
        accessNotesTitle: COPY.access.notesTitle,

        galleryIntroText: COPY.gallery.intro(grammar),
        galleryHintText: COPY.gallery.hint,
        galleryCounterLabel: COPY.gallery.counterLabel,

        playlistKicker: COPY.playlist.kicker,
        playlistTitle: COPY.playlist.title,
        playlistDescription: COPY.playlist.description(grammar),
        playlistCardTitle: COPY.playlist.cardTitle,
        playlistButtonLabel: COPY.playlist.buttonLabel,
        playlistHighlightLabel: COPY.playlist.highlightLabel,
        playlistHighlightSong: normalizeText(data.playlistHighlightSong) || COPY.playlist.highlightSong,

        rsvpKidsInfoLabel: COPY.rsvp.kidsInfoLabel(grammar),
        rsvpKidsInfoPlaceholder: COPY.rsvp.kidsInfoPlaceholder(grammar),

        welcomeTitle: buildWelcomeTitle(data),
        welcomeMessage: normalizeText(data.welcomeMessage) || COPY.ready.message
    };
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

function buildHeroStatus(existingConfirmation) {
    if (!existingConfirmation) {
        return {
            label: "Falta confirmar",
            state: "pending",
            hint: "Esperamos tu respuesta"
        };
    }

    if (existingConfirmation.status === "yes") {
        const count = Math.max(1, Number(existingConfirmation.attendingCount) || 1);
        return {
            label: count === 1 ? "Asistencia confirmada" : `${count} lugares confirmados`,
            state: "confirmed",
            hint: "Podés editarla cuando quieras"
        };
    }

    return {
        label: "Respuesta registrada",
        state: "declined",
        hint: "Gracias por avisarnos"
    };
}

export function getInvitationViewData(data) {
    const companions = normalizeCompanions(data.companions);
    const rawGallery = normalizeGallery(data.gallery);
    const giftTitle = normalizeText(data.giftTitle) || "Aporte para luna de miel";
    const giftIntro = normalizeText(data.giftIntro);
    const giftBankData = typeof data.giftBankData === "string" ? data.giftBankData.trim() : "";
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

    const dynamicCopy = buildDynamicCopy(data, companions);
    const heroStatus = buildHeroStatus(existingConfirmation);

    return {
        ...data,
        ...dynamicCopy,
        companions,
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
        hasConfirmation: true,
        giftTitle,
        giftIntro,
        giftBankData,
        hasGift: Boolean(giftIntro || giftBankData),
        heroStatusLabel: heroStatus.label,
        heroStatusState: heroStatus.state,
        heroStatusHint: heroStatus.hint
    };
}
