let lastTriggerContext = null;

function setLightboxState(els, isOpen) {
    if (!els.lightbox) return;

    els.lightbox.classList.toggle("hidden", !isOpen);
    els.lightbox.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("lightbox-open", isOpen);
}

function getCounterText(index, total) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const safeIndex = Math.min(safeTotal, Math.max(1, (Number(index) || 0) + 1));
    return `${String(safeIndex).padStart(2, "0")} / ${String(safeTotal).padStart(2, "0")}`;
}

function syncLightboxMeta(els, context = {}) {
    if (els.lightboxCaptionText) {
        els.lightboxCaptionText.textContent = context.alt || "Vista ampliada";
    }

    const total = Number(context.total) || 0;
    const index = Number(context.galleryIndex) || 0;

    if (els.lightboxCaptionCounter) {
        if (total > 1) {
            els.lightboxCaptionCounter.textContent = getCounterText(index, total);
            els.lightboxCaptionCounter.classList.remove("hidden");
        } else {
            els.lightboxCaptionCounter.classList.add("hidden");
            els.lightboxCaptionCounter.textContent = "";
        }
    }

    const hasNavigation = total > 1;
    els.lightboxPrev?.classList.toggle("hidden", !hasNavigation);
    els.lightboxNext?.classList.toggle("hidden", !hasNavigation);
}

function navigateLightbox(els, step) {
    const context = lastTriggerContext;
    if (!context?.gallerySources?.length) return;

    const total = context.gallerySources.length;
    const currentIndex = Number(context.galleryIndex) || 0;
    const nextIndex = (currentIndex + step + total) % total;
    const nextSrc = context.gallerySources[nextIndex];
    const nextAlt = total > 1
        ? `Foto de la invitación ${nextIndex + 1}`
        : "Vista ampliada";

    openLightbox(els, nextSrc, nextAlt, {
        ...context,
        galleryIndex: nextIndex,
        alt: nextAlt
    });
}

export function openLightbox(els, src, alt = "", context = {}) {
    if (!els.lightbox || !els.lightboxImage) return;

    lastTriggerContext = {
        ...context,
        alt
    };

    els.lightboxImage.src = src;
    els.lightboxImage.alt = alt;
    syncLightboxMeta(els, lastTriggerContext);
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

    if (els.lightboxCaptionText) {
        els.lightboxCaptionText.textContent = "Vista ampliada";
    }

    if (els.lightboxCaptionCounter) {
        els.lightboxCaptionCounter.classList.add("hidden");
        els.lightboxCaptionCounter.textContent = "";
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
    els.lightboxPrev?.addEventListener("click", () => navigateLightbox(els, -1));
    els.lightboxNext?.addEventListener("click", () => navigateLightbox(els, 1));

    els.lightbox?.addEventListener("click", (event) => {
        if (event.target === els.lightbox) {
            closeLightbox(els);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (els.lightbox?.classList.contains("hidden")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox(els);
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigateLightbox(els, -1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            navigateLightbox(els, 1);
        }
    });
}
