import { COPY } from "../constants/copy.js";
import { wait } from "../utils/wait.js";

async function swapText(el, newText) {
    if (!el) return;

    el.classList.add("fade-swap", "out");

    await wait(250);

    el.textContent = newText;

    el.classList.remove("out");
    el.classList.add("in");

    setTimeout(() => {
        el.classList.remove("fade-swap", "in");
    }, 500);
}

export async function renderHero(els, data) {
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
        )
    ]);
}
