import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";

function buildTags(data) {
    const tags = [];

    if (data.companionsText) {
        tags.push({
            label: data.companionsText,
            icon: "👥"
        });
    }

    tags.push({
        label: data.kidsAllowed ? COPY.tags.kidsAllowed : COPY.tags.adultsOnly,
        icon: data.kidsAllowed ? "🧒" : "✨"
    });

    if (data.dressCode) {
        tags.push({
            label: `Dress code: ${data.dressCode}`,
            icon: "👔"
        });
    }

    return tags;
}

function renderTags(container, tags) {
    if (!container) return;

    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    tags.forEach(({ label, icon }) => {
        const span = document.createElement("span");
        span.className = "tag";

        const iconNode = document.createElement("span");
        iconNode.className = "tag-icon";
        iconNode.textContent = icon;

        const textNode = document.createElement("span");
        textNode.textContent = label;

        span.append(iconNode, textNode);
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

    if (els.rsvpHelperText) {
        if (typeof data.rsvpDaysLeft === "number" && data.rsvpDaysLeft >= 0 && data.rsvpDaysLeft <= 3) {
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