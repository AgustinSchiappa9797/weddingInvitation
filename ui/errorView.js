import { COPY } from "../constants/copy.js";

export function hideError(els) {
    if (els.errorSection) {
        els.errorSection.classList.add("hidden");
    }
}

export function showError(
    els,
    {
        heroTitle = COPY.errors.fallback.heroTitle,
        heroSubtitle = COPY.errors.fallback.heroSubtitle,
        guestName = COPY.errors.fallback.guestName,
        welcomeKickerText = COPY.errors.fallback.welcomeKickerText,
        welcomeTitle = COPY.errors.fallback.welcomeTitle,
        welcomeMessageText = COPY.errors.fallback.welcomeMessageText,
        errorTitle = COPY.errors.fallback.errorTitle,
        errorMessage = COPY.errors.fallback.errorMessage
    } = {}
) {
    if (els.mainTitle) els.mainTitle.textContent = heroTitle;
    if (els.mainSubtitle) els.mainSubtitle.textContent = heroSubtitle;
    if (els.guestName) els.guestName.textContent = guestName;
    if (els.guestExtra) els.guestExtra.textContent = "";

    if (els.errorTitle) els.errorTitle.textContent = errorTitle;
    if (els.errorMessage) els.errorMessage.textContent = errorMessage;
    if (els.errorSection) els.errorSection.classList.remove("hidden");

    if (els.welcomeKicker) els.welcomeKicker.textContent = welcomeKickerText;
    if (els.welcomeGuestName) els.welcomeGuestName.textContent = welcomeTitle;
    if (els.welcomeMessage) els.welcomeMessage.textContent = welcomeMessageText;
    if (els.welcomeLoader) els.welcomeLoader.classList.add("hidden");
    if (els.welcomeReady) els.welcomeReady.classList.add("hidden");

    document.body.classList.remove("bg-ready");
}