function setCountdownValues(els, { days = "00", hours = "00", minutes = "00", seconds = "00" }) {
    if (els.days) els.days.textContent = days;
    if (els.hours) els.hours.textContent = hours;
    if (els.minutes) els.minutes.textContent = minutes;
    if (els.seconds) els.seconds.textContent = seconds;
}

export function renderCountdown(els, state, data) {
    if (!els.countdownSection) return;

    state.clearCountdown();

    if (!data.eventIsoDate) {
        state.setEventDate(null);
        els.countdownSection.classList.add("hidden");
        return;
    }

    const parsedDate = new Date(data.eventIsoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        state.setEventDate(null);
        els.countdownSection.classList.add("hidden");
        return;
    }

    state.setEventDate(parsedDate);
    els.countdownSection.classList.remove("hidden");
    updateCountdown(els, state);

    state.setCountdownInterval(
        setInterval(() => updateCountdown(els, state), 1000)
    );
}

export function updateCountdown(els, state) {
    if (!state.eventDate) return;

    const now = new Date();
    const diff = state.eventDate.getTime() - now.getTime();

    if (diff <= 0) {
        setCountdownValues(els, {});
        state.clearCountdown();
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setCountdownValues(els, {
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
    });
}