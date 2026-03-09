export function setOptionalLink(element, url) {
    if (!element) return;

    let isValid = false;

    try {
        const parsed = new URL(url);
        isValid = parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        isValid = false;
    }

    if (isValid) {
        element.href = url;
        element.classList.remove("hidden");
    } else {
        element.removeAttribute("href");
        element.classList.add("hidden");
    }
}
