import {
    API_URL,
    FETCH_TIMEOUT_MS,
    INVITATION_CACHE_TTL_MS
} from "../config.js";

const CACHE_PREFIX = "wedding-invitation:";

function getCachedInvitation(token) {
    try {
        const raw = sessionStorage.getItem(`${CACHE_PREFIX}${token}`);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.timestamp || !parsed.data) return null;

        const isFresh = Date.now() - parsed.timestamp < INVITATION_CACHE_TTL_MS;
        return isFresh ? parsed.data : null;
    } catch {
        return null;
    }
}

function setCachedInvitation(token, data) {
    try {
        sessionStorage.setItem(
            `${CACHE_PREFIX}${token}`,
            JSON.stringify({
                timestamp: Date.now(),
                data
            })
        );
    } catch {
    }
}

export async function fetchInvitation(token) {
    const cached = getCachedInvitation(token);
    if (cached) return cached;

    const url = `${API_URL}?token=${encodeURIComponent(token)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            throw new Error("INVALID_RESPONSE_FORMAT");
        }

        const data = await response.json();
        setCachedInvitation(token, data);

        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("REQUEST_TIMEOUT");
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}