import { createOrangeCatApi } from "./animations.js";
import { setupCatBehavior } from "./catBehavior.js";

export function createCatController() {
    let initialized = false;

    function setup() {
        if (initialized) {
            return;
        }

        const isMobile =
            window.matchMedia?.("(max-width: 720px)")?.matches ??
            window.innerWidth <= 720;

        if (isMobile) {
            return;
        }

        const catApi = createOrangeCatApi();

        if (!catApi) {
            return;
        }

        setupCatBehavior(catApi);
        initialized = true;
    }

    return {
        setup
    };
}