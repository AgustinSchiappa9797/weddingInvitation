import { BACKGROUND_IMAGE_PRELOAD_TIMEOUT_MS } from "../config.js";

function normalizeImageUrl(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) return "";

    if (rawValue.startsWith("data:image/") || rawValue.startsWith("blob:")) {
        return rawValue;
    }

    try {
        const url = new URL(rawValue, window.location.href);
        return ["http:", "https:", "file:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

function ensureImagePreloadLink(url) {
    const head = document.head;
    if (!head) return;

    const normalizedUrl = normalizeImageUrl(url);
    let link = document.querySelector('link[data-dynamic-bg-preload="true"]');

    if (!normalizedUrl) {
        if (link) link.remove();
        return;
    }

    if (!link) {
        link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.setAttribute("data-dynamic-bg-preload", "true");
        link.setAttribute("href", normalizedUrl);
        head.appendChild(link);
        return;
    }

    if (link.getAttribute("href") !== normalizedUrl) {
        link.setAttribute("href", normalizedUrl);
    }
}

function preloadImage(url, timeoutMs = BACKGROUND_IMAGE_PRELOAD_TIMEOUT_MS) {
    return new Promise((resolve) => {
        const normalizedUrl = normalizeImageUrl(url);
        if (!normalizedUrl) {
            resolve(false);
            return;
        }

        const img = new Image();
        let settled = false;

        const markLoaded = () => {
            document.body.classList.add("bg-image-loaded");
        };

        const finish = (loaded) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            if (loaded) {
                markLoaded();
            }
            resolve(loaded);
        };

        const timeoutId = window.setTimeout(() => finish(false), timeoutMs);

        img.decoding = "async";
        img.fetchPriority = "high";
        img.referrerPolicy = "no-referrer";

        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = normalizedUrl;

        if (typeof img.decode === "function") {
            img.decode().then(() => finish(true)).catch(() => { });
        }
    });
}

function applyBackground(url) {
    const normalizedUrl = normalizeImageUrl(url);
    if (!normalizedUrl) return;

    document.documentElement.style.setProperty("--bg-photo", `url("${normalizedUrl}")`);
    document.body.classList.add("has-dynamic-bg");
}

function clearBackground() {
    document.documentElement.style.removeProperty("--bg-photo");
    document.body.classList.remove("has-dynamic-bg", "bg-image-loaded");
}

export async function renderBackground(els, data) {
    const overlay = els.bgOverlay;
    if (!overlay) return false;

    const imageUrl = normalizeImageUrl(data?.backgroundImage || "");

    if (!imageUrl) {
        clearBackground();
        return false;
    }

    ensureImagePreloadLink(imageUrl);
    applyBackground(imageUrl);

    return preloadImage(imageUrl);
}