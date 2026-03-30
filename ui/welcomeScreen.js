import { COPY } from "../constants/copy.js";
import { WELCOME_SCREEN_HIDE_DELAY_MS } from "../config.js";
import { wait } from "../utils/wait.js";

export function showWelcomeScreen(els) {
    if (!els.welcomeScreen) return;
    els.welcomeScreen.classList.remove("hidden", "is-leaving");
}

export function setWelcomeScreenLoadingState(els) {
    if (els.welcomeKicker) els.welcomeKicker.textContent = COPY.loading.kicker;
    if (els.welcomeGuestName) els.welcomeGuestName.textContent = COPY.loading.title;
    if (els.welcomeLead) els.welcomeLead.textContent = COPY.cinematic.loadingLead;
    if (els.welcomeMessage) els.welcomeMessage.textContent = COPY.loading.message;
    if (els.welcomeClosingLine) els.welcomeClosingLine.textContent = COPY.cinematic.loadingClosingLine;
    if (els.welcomeLoader) els.welcomeLoader.classList.remove("hidden");
    if (els.welcomeReady) els.welcomeReady.classList.add("hidden");
    if (els.welcomeProgressText) {
        els.welcomeProgressText.textContent = COPY.cinematic.progress.validating;
    }

    if (els.welcomeScreen) {
        els.welcomeScreen.classList.remove("is-ready");
    }

    document.body.classList.remove("bg-ready");
}

export function setWelcomeScreenReadyState(els, invitation) {
    if (els.welcomeKicker) els.welcomeKicker.textContent = COPY.ready.kicker;
    if (els.welcomeGuestName) {
        els.welcomeGuestName.textContent = invitation.welcomeTitle || invitation.guestName || COPY.ready.guestFallback;
    }
    if (els.welcomeLead) {
        els.welcomeLead.textContent = invitation.welcomeLead || COPY.cinematic.readyLead;
    }
    if (els.welcomeMessage) {
        els.welcomeMessage.textContent = invitation.welcomeMessage || COPY.ready.message;
    }
    if (els.welcomeClosingLine) {
        els.welcomeClosingLine.textContent = invitation.welcomeClosingLine || COPY.cinematic.readyClosingLine;
    }
    if (els.welcomeLoader) els.welcomeLoader.classList.add("hidden");
    if (els.welcomeReady) els.welcomeReady.classList.remove("hidden");
    if (els.welcomeScreen) {
        els.welcomeScreen.classList.add("is-ready");
    }

    document.body.classList.add("bg-ready");
}

export function setWelcomeScreenProgress(els, text) {
    if (els.welcomeProgressText) {
        els.welcomeProgressText.textContent = text;
    }
}

export async function hideWelcomeScreen(els) {
    if (!els.welcomeScreen) return;

    els.welcomeScreen.classList.add("is-leaving");
    await wait(WELCOME_SCREEN_HIDE_DELAY_MS);
    els.welcomeScreen.classList.add("hidden");
    els.welcomeScreen.classList.remove("is-leaving");
}
