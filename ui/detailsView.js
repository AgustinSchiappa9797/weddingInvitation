import { COPY } from "../constants/copy.js";
import { setOptionalLink } from "../utils/links.js";
import { buildGoogleCalendarUrl } from "../utils/calendar.js";

function renderTimeline(els, timeline) {
    if (!els.timelineSection || !els.timeline) return;

    els.timeline.replaceChildren();

    if (!Array.isArray(timeline) || timeline.length === 0) {
        els.timelineSection.classList.add("hidden");
        return;
    }

    const fragment = document.createDocumentFragment();

    timeline.forEach((item) => {
        const row = document.createElement("div");
        row.className = "timeline-item";

        const time = document.createElement("div");
        time.className = "timeline-time";
        time.textContent = item.time;

        const content = document.createElement("div");
        content.className = "timeline-content";

        const title = document.createElement("strong");
        title.textContent = item.title;
        content.appendChild(title);

        if (item.description) {
            const description = document.createElement("p");
            description.textContent = item.description;
            content.appendChild(description);
        }

        row.append(time, content);
        fragment.appendChild(row);
    });

    els.timeline.appendChild(fragment);
    els.timelineSection.classList.remove("hidden");
}

export function renderDetails(els, data) {
    if (els.detailsKicker) els.detailsKicker.textContent = data.detailsKicker || COPY.details.kicker;
    if (els.detailsTitle) els.detailsTitle.textContent = data.detailsTitle || COPY.details.title;
    if (els.detailsIntroText) els.detailsIntroText.textContent = data.detailsIntro || "";
    if (els.detailsScheduleKicker) els.detailsScheduleKicker.textContent = data.detailsScheduleKicker || COPY.details.scheduleKicker;
    if (els.detailsScheduleTitle) els.detailsScheduleTitle.textContent = data.detailsScheduleTitle || COPY.details.scheduleTitle;

    if (els.eventDateText) {
        els.eventDateText.textContent = data.eventDateText || "-";
    }

    if (els.eventTimeText) {
        els.eventTimeText.textContent = data.eventTimeText || "-";
    }

    renderTimeline(els, data.timeline);

    const calendarUrl = buildGoogleCalendarUrl(data);
    setOptionalLink(els.calendarButton, calendarUrl);
}
