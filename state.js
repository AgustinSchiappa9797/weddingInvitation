export const state = {
    eventDate: null,
    countdownInterval: null,
    activeSection: "details",

    setEventDate(date) {
        this.eventDate = date;
    },

    setCountdownInterval(interval) {
        this.countdownInterval = interval;
    },

    setActiveSection(section) {
        this.activeSection = section || "details";
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
        this.activeSection = "details";
    }
};