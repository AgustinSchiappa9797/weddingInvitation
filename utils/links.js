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
        element.target = "_blank";
        element.rel = "noopener noreferrer";
        element.removeAttribute("aria-disabled");
        element.classList.remove("hidden");
    } else {
        element.removeAttribute("href");
        element.removeAttribute("target");
        element.removeAttribute("rel");
        element.setAttribute("aria-disabled", "true");
        element.classList.add("hidden");
    }
}