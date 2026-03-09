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

    if (els.gallery) els.gallery.innerHTML = "";
    if (els.guestTags) els.guestTags.innerHTML = "";

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

async function loadInvitationFlow() {
    showWelcomeScreen(els);
    resetInvitationState();
    setWelcomeScreenLoadingState(els);

    const token = getToken();

    if (!token) {
        showError(els, COPY.errors.missingToken);
        return;
    }

    try {
        const data = await fetchInvitation(token);

        if (!data || !data.ok || !data.invitation) {
            showError(els, COPY.errors.invalidAccess);
            return;
        }

        await renderInvitation(data.invitation);
        setWelcomeScreenReadyState(els, data.invitation);
        await wait(WELCOME_SCREEN_READY_DELAY_MS);
        await hideWelcomeScreen(els);
    } catch (error) {
        console.error("Error cargando invitación:", error);

        const isTimeout = error && error.message === "REQUEST_TIMEOUT";
        showError(els, isTimeout ? COPY.errors.timeout : COPY.errors.connection);
    }
}

async function init() {
    setupAnimations();
    await loadInvitationFlow();
}

document.addEventListener("DOMContentLoaded", init);
