import { setOptionalLink } from "../utils/links.js";

export function renderPlaylist(els, data) {
    if (!els.playlistSection || !els.playlistButton) return;

    setOptionalLink(els.playlistButton, data.playlistUrl);

    const isVisible = !els.playlistButton.classList.contains("hidden");
    els.playlistSection.classList.toggle("hidden", !isVisible);
}