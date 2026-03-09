import { COPY } from "../constants/copy.js";
import { wait } from "../utils/wait.js";

export function showWelcomeScreen(els) {
    if (!els.welcomeScreen) return;
    els.welcomeScreen.classList.remove("hidden", "is-leaving");
}

export function setWelcomeScreenLoadingState(els) {
    if (els.welcomeKicker) els.welcomeKicker.textContent = COPY.loading.kicker;
    if (els.welcomeGuestName) els.welcomeGuestName.textContent = COPY.loading.title;
    if (els.welcomeMessage) els.welcomeMessage.textContent = COPY.loading.message;
    if (els.welcomeLoader) els.welcomeLoader.classList.remove("hidden");
    if (els.welcomeReady) els.welcomeReady.classList.add("hidden");

    document.body.classList.remove("bg-ready");
}

export function setWelcomeScreenReadyState(els, invitation) {
    if (els.welcomeKicker) els.welcomeKicker.textContent = COPY.ready.kicker;
    if (els.welcomeGuestName) els.welcomeGuestName.textContent = invitation.guestName || COPY.ready.guestFallback;
    if (els.welcomeMessage) els.welcomeMessage.textContent = COPY.ready.message;
    if (els.welcomeLoader) els.welcomeLoader.classList.add("hidden");
    if (els.welcomeReady) els.welcomeReady.classList.remove("hidden");

    document.body.classList.add("bg-ready");
}

export async function hideWelcomeScreen(els) {
    if (!els.welcomeScreen) return;

    els.welcomeScreen.classList.add("is-leaving");
    await wait(700);
    els.welcomeScreen.classList.add("hidden");
    els.welcomeScreen.classList.remove("is-leaving");
}
