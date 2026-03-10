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

    if (els.countdownMessage) {
        els.countdownMessage.textContent = "";
        els.countdownMessage.classList.add("hidden");
    }

    state.setEventDate(parsedDate);
    els.countdownSection.classList.remove("hidden");
    updateCountdown(els, state);

    state.setCountdownInterval(
        setInterval(() => updateCountdown(els, state), 1000)
    );
}

function showCountdownMessage(els, message, hideGrid = false) {
    if (els.countdownMessage) {
        els.countdownMessage.textContent = message;
        els.countdownMessage.classList.remove("hidden");
    }

    if (els.countdownLabel) {
        els.countdownLabel.classList.toggle("hidden", hideGrid);
    }

    if (els.countdown) {
        els.countdown.classList.toggle("hidden", hideGrid);
    }
}

export function updateCountdown(els, state, now = new Date()) {
    if (!state.eventDate) return;

    const diff = state.eventDate.getTime() - now.getTime();

    if (diff <= 0) {
        setCountdownValues(els, {});
        showCountdownMessage(els, "Hoy es el gran día.", true);
        state.clearCountdown();
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    showCountdownMessage(
        els,
        days === 0 ? "Falta muy poquito." : "Cada vez falta menos.",
        false
    );

    setCountdownValues(els, {
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
    });
}