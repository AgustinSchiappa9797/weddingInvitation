export function renderCountdown(els, state, data) {
    if (!els.countdownSection) return;

    if (data.eventIsoDate) {
        state.eventDate = new Date(data.eventIsoDate);

        if (!Number.isNaN(state.eventDate.getTime())) {
            els.countdownSection.classList.remove("hidden");
            updateCountdown(els, state);

            if (state.countdownInterval) {
                clearInterval(state.countdownInterval);
            }

            state.countdownInterval = setInterval(() => {
                updateCountdown(els, state);
            }, 1000);

            return;
        }
    }

    state.eventDate = null;
    els.countdownSection.classList.add("hidden");

    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
}

export function updateCountdown(els, state) {
    if (!state.eventDate) return;
    if (!els.days || !els.hours || !els.minutes || !els.seconds) return;

    const now = new Date();
    const diff = state.eventDate - now;

    if (diff <= 0) {
        els.days.textContent = "00";
        els.hours.textContent = "00";
        els.minutes.textContent = "00";
        els.seconds.textContent = "00";

        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = null;
        }

        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    els.days.textContent = String(days).padStart(2, "0");
    els.hours.textContent = String(hours).padStart(2, "0");
    els.minutes.textContent = String(minutes).padStart(2, "0");
    els.seconds.textContent = String(seconds).padStart(2, "0");
}
