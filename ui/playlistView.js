import { setOptionalLink } from "../utils/links.js";

export function renderPlaylist(els, data) {
    if (!els.playlistSection || !els.playlistButton) return;

    if (els.playlistKicker) {
        els.playlistKicker.textContent = data.playlistKicker || "La música también la armamos entre todos";
    }

    if (els.playlistTitle) {
        els.playlistTitle.textContent = data.playlistTitle || "Playlist";
    }

    if (els.playlistDescription) {
        els.playlistDescription.textContent = data.playlistDescription || "Sumá esa canción que no puede faltar 🎶";
    }

    if (els.playlistButton) {
        els.playlistButton.textContent = data.playlistButtonLabel || "Agregar canción";
    }

    setOptionalLink(els.playlistButton, data.playlistUrl);

    const isVisible = !els.playlistButton.classList.contains("hidden");
    els.playlistSection.classList.toggle("hidden", !isVisible);
}