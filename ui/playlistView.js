import { setOptionalLink } from "../utils/links.js";

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getSpotifyEmbedUrl(url) {
    const value = normalizeText(url);
    if (!value) return "";

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.replace(/^www\./, "");
        const pathname = parsed.pathname.replace(/\/$/, "");

        if (host === "open.spotify.com") {
            if (pathname.startsWith("/embed/")) {
                return parsed.toString();
            }

            const match = pathname.match(/^\/(playlist|album|track|artist)\/([A-Za-z0-9]+)$/);
            if (match) {
                return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
            }
        }

        if (host === "spotify.link") {
            return "";
        }
    } catch {
        return "";
    }

    return "";
}

export function renderPlaylist(els, data) {
    if (!els.playlistSection || !els.playlistButton) return;

    if (els.playlistKicker) {
        els.playlistKicker.textContent = data.playlistKicker || "Nuestra música";
    }

    if (els.playlistTitle) {
        els.playlistTitle.textContent = data.playlistTitle || "Playlist";
    }

    if (els.playlistDescription) {
        els.playlistDescription.textContent = data.playlistDescription || "Estas canciones nos acompañaron en momentos importantes. Hoy queremos compartirlas con vos.";
    }

    if (els.playlistCardTitle) {
        els.playlistCardTitle.textContent = data.playlistCardTitle || "Escuchá la playlist del casamiento";
    }

    if (els.playlistHighlightLabel) {
        els.playlistHighlightLabel.textContent = data.playlistHighlightLabel || "Nuestra elegida";
    }

    if (els.playlistHighlightSong) {
        els.playlistHighlightSong.textContent = data.playlistHighlightSong || "Una canción especial para este momento";
    }

    if (els.playlistButton) {
        els.playlistButton.textContent = data.playlistButtonLabel || "Abrir en Spotify";
    }

    setOptionalLink(els.playlistButton, data.playlistUrl);

    const embedUrl = getSpotifyEmbedUrl(data.playlistUrl);

    if (els.playlistEmbed && els.playlistEmbedWrap) {
        if (embedUrl) {
            els.playlistEmbed.src = embedUrl;
            els.playlistEmbed.title = data.playlistCardTitle || "Playlist de Spotify";
            els.playlistEmbed.loading = "lazy";
            els.playlistEmbedWrap.classList.remove("hidden");
        } else {
            els.playlistEmbed.src = "";
            els.playlistEmbedWrap.classList.add("hidden");
        }
    }

    const hasLink = !els.playlistButton.classList.contains("hidden");
    const hasEmbed = Boolean(embedUrl);
    els.playlistSection.classList.toggle("hidden", !hasLink && !hasEmbed);
}
