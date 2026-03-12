import { API_URL, FETCH_TIMEOUT_MS } from "../config.js";

export async function submitConfirmation(payload) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            cache: "no-store",
            signal: controller.signal,
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            throw new Error("INVALID_RESPONSE_FORMAT");
        }

        return await response.json();
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error("REQUEST_TIMEOUT");
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}