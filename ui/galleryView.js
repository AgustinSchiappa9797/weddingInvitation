function isSafeImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function createGalleryImage(src, index) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Foto de la invitación ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    return img;
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
        fragment.appendChild(createGalleryImage(src, index));
    });

    els.gallery.appendChild(fragment);
    els.gallerySection.classList.remove("hidden");
}