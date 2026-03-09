import { setOptionalLink } from "../utils/links.js";

export function renderPlaylist(els, data) {
    if (!els.playlistSection) return;

    if (typeof data.playlistUrl === "string" && data.playlistUrl.trim() !== "") {
        setOptionalLink(els.playlistButton, data.playlistUrl);
        els.playlistSection.classList.remove("hidden");
    } else {
        els.playlistSection.classList.add("hidden");
    }
}
