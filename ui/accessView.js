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

function getDaysUntil(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diff = date.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

    if (els.rsvpHelperText) {
        const daysLeft = getDaysUntil(data.rsvpDeadlineIso);

        if (typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 3) {
            els.rsvpHelperText.textContent = "La fecha de confirmación está muy cerca.";
        } else {
            els.rsvpHelperText.textContent = "Nos ayuda muchísimo para organizar cada detalle.";
        }
    }

    if (els.footerText) {
        els.footerText.textContent = data.footerText || COPY.defaults.footerText;
    }

    setOptionalLink(els.rsvpButton, data.rsvpUrl);

    renderTags(els.guestTags, buildTags(data));
}