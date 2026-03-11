import { COPY } from "./constants/copy.js";
import { WELCOME_SCREEN_READY_DELAY_MS } from "./config.js";
import { getElements } from "./dom/elements.js";
import { state } from "./state.js";
import { fetchInvitation } from "./api/invitationApi.js";
import { wait } from "./utils/wait.js";
import { renderStickyBar } from "./ui/stickyBarView.js";
import { showWelcomeScreen, setWelcomeScreenLoadingState, setWelcomeScreenReadyState, hideWelcomeScreen, setWelcomeScreenProgress } from "./ui/welcomeScreen.js";
import { setupContentPanelNavigation, renderActivePanel, syncContentPanelVisibility } from "./ui/contentPanelView.js";
import { hideError, showError } from "./ui/errorView.js";
import { renderHero } from "./ui/heroView.js";
import { renderDetails } from "./ui/detailsView.js";
import { renderAccess } from "./ui/accessView.js";
import { renderGallery } from "./ui/galleryView.js";
import { renderPlaylist } from "./ui/playlistView.js";
import { renderCountdown } from "./ui/countdownView.js";
import { setupAnimations, revealContentAnimations } from "./ui/animations.js";
import { getInvitationViewData } from "./ui/viewData.js";

const els = Object.freeze(getElements());

function getToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token")?.trim();

    return token || null;
}

function hideElements(...elements) {
    elements.forEach(el => el?.classList.add("hidden"));
}

function resetInvitationState() {
    hideError(els);

    hideElements(
        els.invitationContent,
        els.detailsBtn,
        els.gallerySection,
        els.playlistSection,
        els.countdownSection,
        els.mobileStickyBar,
        els.timelineSection,
        els.errorSection,
        els.lightbox
    );

    if (els.lightboxImage) {
        els.lightboxImage.removeAttribute("src");
        els.lightboxImage.alt = "";
    }

    els.gallery?.replaceChildren();
    els.guestTags?.replaceChildren();

    state.reset();

    [
        els.tabDetails,
        els.tabAccess,
        els.tabGallery,
        els.tabRsvp,
        els.tabPlaylist,
        els.panelDetails,
        els.panelAccess,
        els.panelGallery,
        els.panelRsvp,
        els.panelPlaylist
    ].forEach((element) => {
        element?.classList.remove("hidden");
    });

    renderActivePanel(els, state, {
        hasGallery: true,
        hasRsvp: true,
        hasPlaylist: true
    });
}

function showInvitationShell() {
    els.invitationContent?.classList.remove("hidden");
    els.detailsBtn?.classList.remove("hidden");
}

function renderInvitationSections(viewData) {
    renderDetails(els, viewData);
    renderAccess(els, viewData);
    renderGallery(els, viewData);
    renderPlaylist(els, viewData);
    renderCountdown(els, state, viewData);
    renderStickyBar(els, viewData);
}

async function renderInvitation(data) {
    const viewData = getInvitationViewData(data);

    state.setActiveSection("details");

    document.body.dataset.eventPhase = viewData.eventPhase || "upcoming";

    await renderHero(els, viewData);

    showInvitationShell();
    renderInvitationSections(viewData);
    syncContentPanelVisibility(els, state, viewData);
    revealContentAnimations();
}

async function showInvitationError(copy) {
    showError(els, copy);
    await hideWelcomeScreen(els);
}

async function getInvitationData(token) {
    const data = await fetchInvitation(token);

    if (!data || !data.ok || !data.invitation) {
        throw new Error("INVALID_INVITATION");
    }

    return data.invitation;
}

async function handleInvitationError(error) {
    console.error("Error cargando invitación:", error);

    if (error?.message === "REQUEST_TIMEOUT") {
        return showInvitationError(COPY.errors.timeout);
    }

    if (error?.message === "INVALID_INVITATION") {
        return showInvitationError(COPY.errors.invalidAccess);
    }

    return showInvitationError(COPY.errors.connection);
}

async function loadInvitationFlow() {
    showWelcomeScreen(els);
    resetInvitationState();
    setWelcomeScreenLoadingState(els);
    setWelcomeScreenProgress(els, "Validando acceso…");

    const token = getToken();

    if (!token) {
        return showInvitationError(COPY.errors.missingToken);
    }

    setWelcomeScreenProgress(els, "Preparando invitación…");

    try {
        const invitation = await getInvitationData(token);

        await renderInvitation(invitation);
        setWelcomeScreenProgress(els, "Todo listo.");

        setWelcomeScreenReadyState(els, invitation);

        await wait(WELCOME_SCREEN_READY_DELAY_MS);
        await hideWelcomeScreen(els);
    } catch (error) {
        await handleInvitationError(error);
    }
}

let initialized = false;

async function init() {
    if (initialized) return;
    initialized = true;

    setupAnimations();

    els.lightboxClose?.addEventListener("click", () => {
        els.lightbox?.classList.add("hidden");
        els.lightbox?.setAttribute("aria-hidden", "true");
    });

    els.lightbox?.addEventListener("click", (event) => {
        if (event.target === els.lightbox) {
            els.lightbox.classList.add("hidden");
            els.lightbox.setAttribute("aria-hidden", "true");
        }
    });

    els.retryButton?.addEventListener("click", () => {
        els.retryButton.disabled = true;
        window.location.reload();
    });

    setupContentPanelNavigation(els, state);
    await loadInvitationFlow();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}