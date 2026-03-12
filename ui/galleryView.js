import { openLightbox } from "./lightboxView.js";

function isSafeImageUrl(value) {
    try {
        const url = new URL(value, window.location.href);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function centerGalleryItem(item, behavior = "smooth") {
    item?.scrollIntoView({
        behavior,
        block: "nearest",
        inline: "center"
    });
}

function createGalleryItem(src, index, els) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.dataset.galleryIndex = String(index);
    button.setAttribute("aria-label", `Abrir foto ${index + 1} de la galería`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Foto de la invitación ${index + 1}`;
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.referrerPolicy = "no-referrer";

    const handleOpen = () => {
        if (button.dataset.dragSuppressed === "true") return;

        centerGalleryItem(button);
        openLightbox(els, src, img.alt, {
            triggerElement: button,
            galleryIndex: index
        });
    };

    button.appendChild(img);
    button.addEventListener("click", handleOpen);

    return button;
}

function setupGalleryDrag(container) {
    if (!container || container.dataset.dragReady === "true") return;

    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const suppressClicksTemporarily = () => {
        const items = container.querySelectorAll(".gallery-item");
        items.forEach((item) => {
            item.dataset.dragSuppressed = "true";
        });

        window.setTimeout(() => {
            items.forEach((item) => {
                delete item.dataset.dragSuppressed;
            });
        }, 220);
    };

    const endDrag = (event) => {
        if (pointerId !== null && event?.pointerId != null && event.pointerId !== pointerId) return;

        if (moved) {
            suppressClicksTemporarily();
        }

        pointerId = null;
        moved = false;
        container.classList.remove("is-dragging");
    };

    container.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        pointerId = event.pointerId;
        startX = event.clientX;
        startScrollLeft = container.scrollLeft;
        moved = false;
        container.classList.add("is-dragging");
        container.setPointerCapture?.(event.pointerId);
    });

    container.addEventListener("pointermove", (event) => {
        if (pointerId !== event.pointerId) return;

        const deltaX = event.clientX - startX;

        if (Math.abs(deltaX) > 8) {
            moved = true;
        }

        if (!moved) return;

        event.preventDefault();
        container.scrollLeft = startScrollLeft - deltaX;
    });

    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("lostpointercapture", endDrag);

    container.dataset.dragReady = "true";
}

function restoreCenteredItem(container, index) {
    if (!container || !Number.isInteger(index)) return;

    const item = container.querySelector(`[data-gallery-index="${index}"]`);
    if (!item) return;

    requestAnimationFrame(() => {
        centerGalleryItem(item);
        item.focus?.({ preventScroll: true });
    });
}

export function renderGallery(els, data) {
    if (!els.gallerySection || !els.gallery) return;

    els.gallery.replaceChildren();

    const validImages = Array.isArray(data.gallery)
        ? data.gallery.filter(isSafeImageUrl)
        : [];

    if (validImages.length === 0) {
        els.gallerySection.classList.add("hidden");
        return;
    }

    const fragment = document.createDocumentFragment();

    validImages.forEach((src, index) => {
        fragment.appendChild(createGalleryItem(src, index, els));
    });

    els.gallery.appendChild(fragment);
    setupGalleryDrag(els.gallery);
    els.gallerySection.classList.remove("hidden");

    if (validImages.length > 1) {
        requestAnimationFrame(() => {
            const firstItem = els.gallery.querySelector('[data-gallery-index="0"]');
            centerGalleryItem(firstItem, "auto");
        });
    }

    if (els.gallery.dataset.restoreListenerReady !== "true") {
        document.addEventListener("lightbox:closed", (event) => {
            restoreCenteredItem(els.gallery, event.detail?.galleryIndex);
        });

        els.gallery.dataset.restoreListenerReady = "true";
    }
}
