import { API_URL, FETCH_TIMEOUT_MS } from "../config.js";

export async function fetchInvitation(token) {
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
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("REQUEST_TIMEOUT");
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
