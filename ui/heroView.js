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

function getHeroSecondaryActionLabel(data) {
    if (data?.hasMap || data?.venueName || data?.venueAddress) {
        return "Ver ubicación";
    }

    return "Ver detalles";
}

function getHeroRsvpMeta(data) {
    if (data?.existingConfirmation?.status === "yes") {
        return "Tu confirmación ya quedó guardada";
    }

    if (data?.existingConfirmation?.status === "no") {
        return "Ya recibimos tu respuesta";
    }

    if (typeof data?.confirmationDaysLeft === "number") {
        if (data.confirmationDaysLeft < 0) {
            return "La confirmación ya cerró";
        }

        if (data.confirmationDaysLeft === 0) {
            return "Último día para confirmar";
        }

        if (data.confirmationDaysLeft === 1) {
            return "Queda 1 día para responder";
        }

        return `Quedan ${data.confirmationDaysLeft} días para responder`;
    }

    return data?.heroStatusHint || "Esperamos tu respuesta";
}

function getHeroStatusFromConfirmation(existingConfirmation) {
    if (!existingConfirmation) {
        return {
            label: "Falta confirmar",
            state: "pending",
            hint: "Esperamos tu respuesta"
        };
    }

    if (existingConfirmation.status === "yes") {
        const count = Math.max(1, Number(existingConfirmation.attendingCount) || 1);
        return {
            label: count === 1 ? "Asistencia confirmada" : `${count} lugares confirmados`,
            state: "confirmed",
            hint: "Tu confirmación ya quedó guardada"
        };
    }

    return {
        label: "Respuesta registrada",
        state: "declined",
        hint: "Ya recibimos tu respuesta"
    };
}

function renderHeroHighlights(els, data) {
    if (els.heroEventDate) {
        els.heroEventDate.textContent = data?.eventDateText || "Fecha a confirmar";
    }

    if (els.heroEventTime) {
        els.heroEventTime.textContent = data?.eventTimeText || "Horario a confirmar";
    }

    if (els.heroVenueName) {
        els.heroVenueName.textContent = data?.venueName || "Lugar a confirmar";
    }

    if (els.heroVenueAddress) {
        els.heroVenueAddress.textContent = data?.venueAddress || "Pronto compartiremos la dirección";
    }

    if (els.heroRsvpDeadline) {
        els.heroRsvpDeadline.textContent = data?.confirmationDeadlineText || "Confirmación abierta";
    }

    if (els.heroRsvpHint) {
        els.heroRsvpHint.textContent = getHeroRsvpMeta(data);
    }

    if (els.heroStatusPill) {
        const hasStatus = Boolean(data?.heroStatusLabel);
        els.heroStatusPill.textContent = data?.heroStatusLabel || "";
        els.heroStatusPill.classList.toggle("hidden", !hasStatus);
        els.heroStatusPill.dataset.state = data?.heroStatusState || "pending";
    }
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

function updateHeroSecondaryAction(els, data, state = null) {
    if (!els.heroSecondaryAction) return;

    els.heroSecondaryAction.textContent = getHeroSecondaryActionLabel(data);
    els.heroSecondaryAction.classList.remove("hidden");

    if (els.heroSecondaryAction.dataset.bound === "true" || !state) return;

    els.heroSecondaryAction.addEventListener("click", () => {
        const targetSection = data?.hasMap || data?.venueName || data?.venueAddress ? "access" : "details";
        goToSection(els, state, targetSection);
    });

    els.heroSecondaryAction.dataset.bound = "true";
}

export function updateHeroRsvpState(els, existingConfirmation, confirmationDeadlineText = "") {
    const heroStatus = getHeroStatusFromConfirmation(existingConfirmation);

    if (els.heroStatusPill) {
        els.heroStatusPill.textContent = heroStatus.label;
        els.heroStatusPill.dataset.state = heroStatus.state;
        els.heroStatusPill.classList.remove("hidden");
    }

    if (els.heroRsvpDeadline && confirmationDeadlineText) {
        els.heroRsvpDeadline.textContent = confirmationDeadlineText;
    }

    if (els.heroRsvpHint) {
        els.heroRsvpHint.textContent = heroStatus.hint;
    }

    updateHeroPrimaryAction(els, { existingConfirmation });
}

export async function renderHero(els, data, state) {
    await Promise.all([
        swapText(
            els.mainTitle,
            data.coupleTitle || COPY.defaults.heroTitle
        ),
        swapText(
            els.mainSubtitle,
            data.heroSubtitle || COPY.defaults.heroSubtitle(data.grammar || { isPlural: false })
        ),
        swapText(
            els.guestName,
            data.guestName || COPY.defaults.guestName
        ),
    ]);

    renderHeroHighlights(els, data);
    updateHeroPrimaryAction(els, data, state);
    updateHeroSecondaryAction(els, data, state);
}