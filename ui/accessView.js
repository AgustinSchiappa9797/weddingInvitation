import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";

function buildTags(data) {
    const tags = [];

    if (data.companionsText) {
        tags.push(data.companionsText);
    }

    tags.push(data.kidsAllowed ? COPY.tags.kidsAllowed : COPY.tags.adultsOnly);

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

export function renderAccess(els, data) {
    if (els.guestExtra) {
        els.guestExtra.textContent = data.companionsText;
    }

    if (els.personalMessage) {
        els.personalMessage.textContent = data.message || "";
    }

    if (els.rsvpDeadline) {
        els.rsvpDeadline.textContent =
            data.rsvpDeadlineText || COPY.defaults.rsvpDeadline;
    }

    if (els.footerText) {
        els.footerText.textContent = data.footerText || COPY.defaults.footerText;
    }

    setOptionalLink(els.rsvpButton, data.rsvpUrl);

    renderTags(els.guestTags, buildTags(data));
}