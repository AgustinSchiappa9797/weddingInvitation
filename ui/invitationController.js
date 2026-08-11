import { COPY } from "../constants/copy.js";
import { WELCOME_SCREEN_READY_DELAY_MS } from "../config.js";
import { fetchInvitation } from "../api/invitationApi.js";
import { wait } from "../utils/wait.js";
import { showWelcomeScreen, setWelcomeScreenLoadingState, setWelcomeScreenReadyState, hideWelcomeScreen, setWelcomeScreenProgress } from "./welcomeScreen.js";
import { renderActiveNavigation, syncNavigationVisibility, syncSectionFromHash } from "./navigation.js";
import { renderHero } from "./heroView.js";
import { revealContentAnimations } from "./animations.js";
import { createCatController } from "./catController.js";
import { closeLightbox } from "./lightboxView.js";
import { getInvitationViewData } from "./viewData.js";
import { renderBackground } from "./backgroundView.js";
import { createErrorController } from "./errorController.js";
import { createInvitationRenderer } from "./invitationRenderer.js";

export function createInvitationController(els, state) {
    const errorController = createErrorController(els);
    const invitationRenderer = createInvitationRenderer(els, state);
    const catController = createCatController();

    function getToken() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token")?.trim();

        if (!token) {
            return null;
        }

        url.searchParams.delete("token");

        window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`
        );

        return token;
    }

    function hideElements(...elements) {
        elements.forEach((element) => {
            element?.classList.add("hidden");
        });
    }

    function resetInvitationState() {
        els.errorSection?.classList.add("hidden");

        hideElements(
            els.invitationContent,
            els.gallerySection,
            els.playlistSection,
            els.countdownSection,
            els.timelineSection,
            els.errorSection,
            els.lightbox
        );

        closeLightbox(els);

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
            els.panelPlaylist,
            els.tabGift,
            els.panelGift
        ].forEach((element) => {
            element?.classList.remove("hidden");
        });

        renderActiveNavigation(els, state, {
            hasGallery: true,
            hasConfirmation: true,
            hasPlaylist: true,
            hasGift: true
        });
    }

    function showInvitationShell() {
        els.invitationContent?.classList.remove("hidden");
    }

    async function renderInvitation(data, options = {}) {
        const viewData = getInvitationViewData(data);

        state.setActiveSection("details");

        document.body.dataset.eventPhase =
            viewData.eventPhase || "upcoming";

        void renderBackground(els, viewData);
        await renderHero(els, viewData, state);

        showInvitationShell();

        catController.setup();

        invitationRenderer.renderSections(
            viewData,
            options
        );

        syncNavigationVisibility(
            els,
            state,
            viewData
        );

        syncSectionFromHash(
            els,
            state
        );

        renderActiveNavigation(
            els,
            state,
            viewData
        );

        revealContentAnimations();
    }

    async function getInvitationData(token) {
        const data = await fetchInvitation(token);

        if (
            !data ||
            !data.ok ||
            !data.invitation
        ) {
            throw new Error("INVALID_INVITATION");
        }

        return data.invitation;
    }

    async function load() {
        showWelcomeScreen(els);
        resetInvitationState();

        setWelcomeScreenLoadingState(els);

        setWelcomeScreenProgress(
            els,
            COPY.cinematic.progress.validating
        );

        const token = getToken();

        if (!token) {
            return errorController.showInvitationError(
                COPY.errors.missingToken
            );
        }

        setWelcomeScreenProgress(
            els,
            COPY.cinematic.progress.preparing
        );

        try {
            const invitation =
                await getInvitationData(token);

            setWelcomeScreenProgress(
                els,
                COPY.cinematic.progress.cover
            );

            await renderInvitation(
                invitation,
                { token }
            );

            setWelcomeScreenProgress(
                els,
                COPY.cinematic.progress.done
            );

            setWelcomeScreenReadyState(
                els,
                invitation
            );

            await wait(
                WELCOME_SCREEN_READY_DELAY_MS
            );

            await hideWelcomeScreen(els);
        } catch (error) {
            await errorController.handleInvitationError(error);
        }
    }

    return {
        load
    };
}