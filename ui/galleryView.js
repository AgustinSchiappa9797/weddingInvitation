export function renderGallery(els, data) {
    if (!els.gallerySection || !els.gallery) return;

    if (Array.isArray(data.gallery) && data.gallery.length > 0) {
        const galleryHtml = data.gallery
            .map(
                (src, index) =>
                    `<img src="${encodeURI(src)}" alt="Foto ${index + 1}" loading="lazy" />`
            )
            .join("");

        els.gallery.innerHTML = galleryHtml;
        els.gallerySection.classList.remove("hidden");
    } else {
        els.gallery.innerHTML = "";
        els.gallerySection.classList.add("hidden");
    }
}
