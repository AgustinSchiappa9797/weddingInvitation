import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";
import { escapeHtml } from "../utils/escapeHtml.js";

export function renderAccess(els, data) {
    if (els.guestExtra) {
        els.guestExtra.textContent = data.companionsText;
    }

    if (els.personalMessage) {
        els.personalMessage.textContent = data.message || "";
    }

    if (els.rsvpDeadline) {
        els.rsvpDeadline.textContent = data.rsvpDeadlineText || COPY.defaults.rsvpDeadline;
    }

    if (els.footerText) {
        els.footerText.textContent = data.footerText || COPY.defaults.footerText;
    }

    setOptionalLink(els.rsvpButton, data.rsvpUrl);

    const tags = [data.companionsText];
    tags.push(data.kidsAllowed ? COPY.tags.kidsAllowed : COPY.tags.adultsOnly);

    if (els.guestTags) {
        els.guestTags.innerHTML = tags
            .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join("");
    }
}
