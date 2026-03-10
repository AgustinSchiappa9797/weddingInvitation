export const state = {
    eventDate: null,
    countdownInterval: null,

    setEventDate(date) {
        this.eventDate = date;
    },

    setCountdownInterval(interval) {
        this.countdownInterval = interval;
    },

    clearCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    },

    reset() {
        this.clearCountdown();
        this.eventDate = null;
    }
};