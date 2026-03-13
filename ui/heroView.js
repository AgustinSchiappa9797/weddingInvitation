import { COPY } from "../constants/copy.js";
import { HERO_TEXT_SWAP_DELAY_MS, HERO_TEXT_SWAP_CLEANUP_DELAY_MS } from "../config.js";
import { wait } from "../utils/wait.js";
import { goToSection } from "./navigation.js";

async function swapText(el, newText) {
    if (!el) return;

    el.classList.add("fade-swap", "out");

    await wait(HERO_TEXT_SWAP_DELAY_MS);

    el.textContent = newText;

    el.classList.remove("out");
    el.classList.add("in");

    setTimeout(() => {
        el.classList.remove("fade-swap", "in");
    }, HERO_TEXT_SWAP_CLEANUP_DELAY_MS);
}

function getHeroPrimaryActionLabel(data) {
    return data?.existingConfirmation
        ? "Editar confirmación"
        : "Confirmar asistencia";
}

export function updateHeroPrimaryAction(els, data, state = null) {
    if (!els.heroPrimaryAction) return;

    els.heroPrimaryAction.textContent = getHeroPrimaryActionLabel(data);
    els.heroPrimaryAction.classList.remove("hidden");

    if (els.heroPrimaryAction.dataset.bound === "true" || !state) return;

    els.heroPrimaryAction.addEventListener("click", () => {
        goToSection(els, state, "rsvp");
    });

    els.heroPrimaryAction.dataset.bound = "true";
}

export async function renderHero(els, data, state) {
    await Promise.all([
        swapText(
            els.mainTitle,
            data.coupleTitle || COPY.defaults.heroTitle
        ),
        swapText(
            els.mainSubtitle,
            data.heroText || COPY.defaults.heroSubtitle
        ),
        swapText(
            els.guestName,
            data.guestName || COPY.defaults.guestName
        ),
    ]);

    updateHeroPrimaryAction(els, data, state);
}