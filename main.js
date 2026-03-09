import { COPY } from "./constants/copy.js";
import { WELCOME_SCREEN_READY_DELAY_MS } from "./config.js";
import { getElements } from "./dom/elements.js";
import { state } from "./state.js";
import { fetchInvitation } from "./api/invitationApi.js";
import { wait } from "./utils/wait.js";
import {
    showWelcomeScreen,
    setWelcomeScreenLoadingState,
    setWelcomeScreenReadyState,
    hideWelcomeScreen
} from "./ui/welcomeScreen.js";
import { hideError, showError } from "./ui/errorView.js";
import { renderHero } from "./ui/heroView.js";
import { renderDetails } from "./ui/detailsView.js";
import { renderAccess } from "./ui/accessView.js";
import { renderGallery } from "./ui/galleryView.js";
import { renderPlaylist } from "./ui/playlistView.js";
import { renderCountdown } from "./ui/countdownView.js";
import { setupAnimations, revealContentAnimations } from "./ui/animations.js";
import { getInvitationViewData } from "./ui/viewData.js";

const els = getElements();

function getToken() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
}

function resetInvitationState() {
    hideError(els);

    if (els.invitationContent) els.invitationContent.classList.add("hidden");
    if (els.detailsBtn) els.detailsBtn.classList.add("hidden");
    if (els.gallerySection) els.gallerySection.classList.add("hidden");
    if (els.playlistSection) els.playlistSection.classList.add("hidden");
    if (els.countdownSection) els.countdownSection.classList.add("hidden");

    if (els.gallery) els.gallery.replaceChildren();
    if (els.guestTags) els.guestTags.replaceChildren();

    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }

    state.eventDate = null;
}

function showInvitationShell() {
    if (els.invitationContent) els.invitationContent.classList.remove("hidden");
    if (els.detailsBtn) els.detailsBtn.classList.remove("hidden");
}

async function renderInvitation(data) {
    const viewData = getInvitationViewData(data);

    showInvitationShell();
    renderDetails(els, viewData);
    renderAccess(els, viewData);
    renderGallery(els, viewData);
    renderPlaylist(els, viewData);
    renderCountdown(els, state, viewData);
    revealContentAnimations();

    await renderHero(els, viewData);
}

async function showInvitationError(copy) {
    showError(els, copy);
    await hideWelcomeScreen(els);
}

async function loadInvitationFlow() {
    showWelcomeScreen(els);
    resetInvitationState();
    setWelcomeScreenLoadingState(els);

    const token = getToken();

    if (!token) {
        await showInvitationError(COPY.errors.missingToken);
        return;
    }

    try {
        const data = await fetchInvitation(token);

        if (!data || !data.ok || !data.invitation) {
            await showInvitationError(COPY.errors.invalidAccess);
            return;
        }

        await renderInvitation(data.invitation);
        setWelcomeScreenReadyState(els, data.invitation);
        await wait(WELCOME_SCREEN_READY_DELAY_MS);
        await hideWelcomeScreen(els);
    } catch (error) {
        console.error("Error cargando invitación:", error);

        const isTimeout = error && error.message === "REQUEST_TIMEOUT";
        await showInvitationError(
            isTimeout ? COPY.errors.timeout : COPY.errors.connection
        );
    }
}

async function init() {
    setupAnimations();

    if (els.retryButton) {
        els.retryButton.addEventListener("click", () => {
            els.retryButton.disabled = true;
            window.location.reload();
        });
    }

    await loadInvitationFlow();
}

document.addEventListener("DOMContentLoaded", init);