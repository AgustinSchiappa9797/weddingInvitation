import { getElements } from "./dom/elements.js";
import { state } from "./state.js";

import { setupNavigation } from "./ui/navigation.js";
import { setupAnimations } from "./ui/animations.js";
import { setupLightbox } from "./ui/lightboxView.js";
import { initMusic } from "./ui/musicController.js";
import { setupViewportController } from "./ui/viewportController.js";
import { createInvitationController } from "./ui/invitationController.js";
import { setupSceneController } from "./ui/sceneController.js";

const els = Object.freeze(getElements());

const invitationController = createInvitationController(els, state);

let initialized = false;

async function init() {
    if (initialized) return;

    initialized = true;

    setupAnimations();
    setupLightbox(els);
    initMusic(els);
    setupViewportController(els, state);

    els.retryButton?.addEventListener("click", () => {
        els.retryButton.disabled = true;
        window.location.reload();
    });

    setupSceneController();

    setupNavigation(els, state);

    await invitationController.load();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}