import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";

function buildTags(data) {
    const tags = [];

    if (data.companionsText) {
        tags.push(data.companionsText);
    }

    if (data.kidsTag) {
        tags.push(data.kidsTag);
    }

    if (data.dressCode) {
        tags.push(`Dress code: ${data.dressCode}`);
    }

    return tags;
}

function renderTags(container, tags) {
    if (!container) return;

    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        fragment.appendChild(span);
    });

    container.appendChild(fragment);
}

function renderInfoList(container, items) {
    if (!container) return;

    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        fragment.appendChild(li);
    });

    container.appendChild(fragment);
}

function toggleInfoBlock(block, list, items) {
    if (!block || !list) return false;

    const visibleItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const hasItems = visibleItems.length > 0;

    block.classList.toggle("hidden", !hasItems);

    if (hasItems) {
        renderInfoList(list, visibleItems);
    } else {
        list.replaceChildren();
    }

    return hasItems;
}

function renderGuestMeta(els, data) {
    if (els.guestExtra) {
        els.guestExtra.textContent = data.companionsText;
    }

    if (els.personalMessage) {
        els.personalMessage.textContent = data.message || "";
    }

    renderTags(els.guestTags, buildTags(data));
}

function renderVenue(els, data) {
    if (els.venueName) {
        els.venueName.textContent = data.venueName || "-";
    }

    if (els.venueAddress) {
        els.venueAddress.textContent = data.venueAddress || "-";
    }

    setOptionalLink(els.mapButton, data.mapUrl);
}

function renderAccessNotes(els, data) {
    const hasParking = toggleInfoBlock(els.parkingInfoBlock, els.parkingInfoList, data.parkingInfo);
    const hasEntry = toggleInfoBlock(els.entryInfoBlock, els.entryInfoList, data.entryInfo);
    const hasRecommendations = toggleInfoBlock(els.recommendationsBlock, els.recommendationsList, data.recommendations);

    els.accessNotesSection?.classList.toggle("hidden", !(hasParking || hasEntry || hasRecommendations));
}

function getDaysUntil(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diff = date.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renderRsvpMeta(els, data) {
    if (els.rsvpDeadline) {
        els.rsvpDeadline.textContent =
            data.confirmationDeadlineText || COPY.defaults.rsvpDeadline;
    }

    if (els.rsvpHelperText) {
        const daysLeft = getDaysUntil(data.confirmationDeadlineIso);

        if (typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 3) {
            els.rsvpHelperText.textContent = "La fecha de confirmación está muy cerca.";
        } else {
            els.rsvpHelperText.textContent = "Nos ayuda muchísimo para organizar cada detalle.";
        }
    }

    setOptionalLink(els.rsvpButton, data.confirmationUrl);
}

function renderFooter(els, data) {
    if (els.footerText) {
        els.footerText.textContent = data.footerText || COPY.defaults.footerText;
    }
}

export function renderAccess(els, data) {
    renderVenue(els, data);
    renderGuestMeta(els, data);
    renderAccessNotes(els, data);
    renderRsvpMeta(els, data);
    renderFooter(els, data);
}