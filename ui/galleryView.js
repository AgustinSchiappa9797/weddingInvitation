function isSafeImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function createGalleryItem(src, index, els) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Foto de la invitación ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";

    button.appendChild(img);

    button.addEventListener("click", () => {
        if (!els.lightbox || !els.lightboxImage) return;

        els.lightboxImage.src = src;
        els.lightboxImage.alt = img.alt;
        els.lightbox.classList.remove("hidden");
        els.lightbox.setAttribute("aria-hidden", "false");
    });

    return button;
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
    els.gallerySection.classList.remove("hidden");
}