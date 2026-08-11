import { renderDetails } from "./detailsView.js";
import { renderAccess } from "./accessView.js";
import { renderGallery } from "./galleryView.js";
import { renderConfirmation } from "./confirmationView.js";
import { renderPlaylist } from "./playlistView.js";
import { renderCountdown } from "./countdownView.js";
import { renderGift } from "./giftView.js";

export function createInvitationRenderer(els, state) {
    function renderSections(viewData, options = {}) {
        renderDetails(els, viewData);
        renderAccess(els, viewData);
        renderGallery(els, viewData);

        renderConfirmation(els, viewData, {
            ...options,
            state
        });

        renderPlaylist(els, viewData);
        renderCountdown(els, state, viewData);
        renderGift(els, viewData);
    }

    return {
        renderSections
    };
}