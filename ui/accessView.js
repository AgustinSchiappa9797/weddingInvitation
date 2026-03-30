import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";

function buildTags(data) {
    const tags = [];

    if (data.companionsText) tags.push(data.companionsText);
    if (data.kidsTag) tags.push(data.kidsTag);
    if (data.dressCode) tags.push(`Dress code: ${data.dressCode}`);

    return tags;
}

function buildQuickFacts(data) {
    const facts = [];

    if (data.eventDateText) facts.push({ label: "Fecha", value: data.eventDateText });
    if (data.eventTimeText) facts.push({ label: "Horario", value: data.eventTimeText });
    if (data.dressCode) facts.push({ label: "Dress code", value: data.dressCode });
    if (data.confirmationDeadlineText) {
        facts.push({ label: "Confirmación", value: `Antes del ${data.confirmationDeadlineText}` });
    }

    return facts.slice(0, 4);
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

function renderQuickFacts(container, facts) {
    if (!container) return;

    container.replaceChildren();
    const visibleFacts = Array.isArray(facts) ? facts.filter(Boolean) : [];
    container.classList.toggle("hidden", visibleFacts.length === 0);
    if (!visibleFacts.length) return;

    const fragment = document.createDocumentFragment();
    visibleFacts.forEach((fact) => {
        const article = document.createElement("article");
        article.className = "access-fact-card";

        const label = document.createElement("p");
        label.className = "access-fact-label";
        label.textContent = fact.label || "";

        const value = document.createElement("p");
        value.className = "access-fact-value";
        value.textContent = fact.value || "";

        article.append(label, value);
        fragment.appendChild(article);
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
    if (hasItems) renderInfoList(list, visibleItems);
    else list.replaceChildren();
    return hasItems;
}

function renderGuestMeta(els, data) {
    if (els.guestExtra) els.guestExtra.textContent = data.companionsText;

    if (els.personalMessage) {
        const fallbackMessage = "Queremos que vivas este día con tranquilidad. Acá tenés todo lo necesario para llegar, ubicarte rápido y disfrutar desde el primer minuto.";
        els.personalMessage.textContent = data.message || fallbackMessage;
    }

    if (els.accessKicker) els.accessKicker.textContent = data.accessKicker || COPY.access.kicker;
    if (els.accessTitle) els.accessTitle.textContent = data.accessTitle || COPY.access.title;
    if (els.accessIntroText) els.accessIntroText.textContent = data.accessIntro || "";
    if (els.accessVenueKicker) els.accessVenueKicker.textContent = data.accessVenueKicker || COPY.access.venueKicker;
    if (els.accessRouteHint) els.accessRouteHint.textContent = data.accessRouteHint || COPY.access.routeHint;
    if (els.accessQuickFactsTitle) els.accessQuickFactsTitle.textContent = data.accessQuickFactsTitle || COPY.access.quickFactsTitle;
    if (els.accessNotesTitle) els.accessNotesTitle.textContent = data.accessNotesTitle || COPY.access.notesTitle;
    if (els.mapButton) els.mapButton.textContent = data.accessMapButtonLabel || COPY.access.mapButton;
    if (els.copyAddressButton) els.copyAddressButton.textContent = data.accessCopyAddressButtonLabel || COPY.access.copyAddressButton;

    renderTags(els.guestTags, buildTags(data));
    renderQuickFacts(els.accessQuickFacts, buildQuickFacts(data));
}

function renderVenue(els, data) {
    if (els.venueName) els.venueName.textContent = data.venueName || "-";
    if (els.venueAddress) els.venueAddress.textContent = data.venueAddress || "-";

    setOptionalLink(els.mapButton, data.mapUrl);

    if (els.copyAddressButton) {
        els.copyAddressButton.classList.toggle("hidden", !data.venueAddress);
        els.copyAddressButton.onclick = async () => {
            if (!data.venueAddress) return;
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(data.venueAddress);
                } else {
                    const input = document.createElement("textarea");
                    input.value = data.venueAddress;
                    input.setAttribute("readonly", "");
                    input.style.position = "absolute";
                    input.style.left = "-9999px";
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand("copy");
                    document.body.removeChild(input);
                }

                const original = data.accessCopyAddressButtonLabel || COPY.access.copyAddressButton;
                els.copyAddressButton.textContent = data.accessCopiedText || COPY.access.copied;
                window.setTimeout(() => {
                    if (els.copyAddressButton) els.copyAddressButton.textContent = original;
                }, 1800);
            } catch (error) {
                const original = data.accessCopyAddressButtonLabel || COPY.access.copyAddressButton;
                els.copyAddressButton.textContent = data.accessCopyErrorText || COPY.access.copyError;
                window.setTimeout(() => {
                    if (els.copyAddressButton) els.copyAddressButton.textContent = original;
                }, 1800);
            }
        };
    }
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
        els.rsvpDeadline.textContent = data.confirmationDeadlineText || COPY.defaults.rsvpDeadline;
    }

    if (els.rsvpHelperText) {
        const daysLeft = getDaysUntil(data.confirmationDeadlineIso);
        if (typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 3) {
            els.rsvpHelperText.textContent = "La fecha de confirmación está muy cerca. Responder ahora te va a llevar menos de un minuto.";
        } else {
            els.rsvpHelperText.textContent = "Nos ayuda muchísimo para organizar mesas, menú y cada pequeño detalle.";
        }
    }
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
