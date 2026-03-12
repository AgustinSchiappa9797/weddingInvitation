let lastTriggerContext = null;

function setLightboxState(els, isOpen) {
    if (!els.lightbox) return;

    els.lightbox.classList.toggle("hidden", !isOpen);
    els.lightbox.setAttribute("aria-hidden", String(!isOpen));
}

export function openLightbox(els, src, alt = "", context = {}) {
    if (!els.lightbox || !els.lightboxImage) return;

    lastTriggerContext = context;
    els.lightboxImage.src = src;
    els.lightboxImage.alt = alt;
    setLightboxState(els, true);
}

export function closeLightbox(els) {
    if (!els.lightbox) return;

    const shouldNotify = !els.lightbox.classList.contains("hidden");
    const context = lastTriggerContext;

    setLightboxState(els, false);

    if (els.lightboxImage) {
        els.lightboxImage.removeAttribute("src");
        els.lightboxImage.alt = "";
    }

    if (context?.triggerElement) {
        context.triggerElement.focus?.({ preventScroll: true });
    }

    lastTriggerContext = null;

    if (shouldNotify) {
        document.dispatchEvent(new CustomEvent("lightbox:closed", {
            detail: {
                galleryIndex: context?.galleryIndex ?? null
            }
        }));
    }
}

export function setupLightbox(els) {
    els.lightboxClose?.addEventListener("click", () => closeLightbox(els));

    els.lightbox?.addEventListener("click", (event) => {
        if (event.target === els.lightbox) {
            closeLightbox(els);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !els.lightbox?.classList.contains("hidden")) {
            closeLightbox(els);
        }
    });
}