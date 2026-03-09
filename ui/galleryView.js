function isSafeImageUrl(value) {
    try {
        const url = new URL(value, window.location.origin);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function createGalleryImage(src, index) {
    const img = document.createElement("img");
    img.alt = `Foto ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";

    if (isSafeImageUrl(src)) {
        img.src = src;
    }

    return img;
}

export function renderGallery(els, data) {
    if (!els.gallerySection || !els.gallery) return;

    els.gallery.replaceChildren();

    if (Array.isArray(data.gallery) && data.gallery.length > 0) {
        const fragment = document.createDocumentFragment();

        data.gallery.forEach((src, index) => {
            if (!isSafeImageUrl(src)) return;
            fragment.appendChild(createGalleryImage(src, index));
        });

        if (fragment.childNodes.length > 0) {
            els.gallery.appendChild(fragment);
            els.gallerySection.classList.remove("hidden");
            return;
        }
    }

    els.gallerySection.classList.add("hidden");
}