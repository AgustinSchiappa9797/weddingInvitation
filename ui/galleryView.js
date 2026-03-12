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

function updateActiveGalleryItem(container) {
    if (!container) return;

    const items = [...container.querySelectorAll(".gallery-item")];
    if (!items.length) return;

    const containerCenter = container.scrollLeft + (container.clientWidth / 2);

    let closestItem = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item) => {
        const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
        const distance = Math.abs(containerCenter - itemCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestItem = item;
        }
    });

    items.forEach((item) => {
        item.classList.toggle("is-active", item === closestItem);
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

    button.appendChild(img);
    button.addEventListener("click", (event) => {
        const gallery = els.gallery;
        if (!gallery || gallery.dataset.justDragged === "true") {
            event.preventDefault();
            return;
        }

        centerGalleryItem(button);
        updateActiveGalleryItem(gallery);

        openLightbox(els, src, img.alt, {
            triggerElement: button,
            galleryIndex: index
        });
    });

    return button;
}

function createNavButton(direction) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `gallery-nav-button gallery-nav-button-${direction}`;
    button.dataset.direction = direction;
    button.setAttribute("aria-label", direction === "prev" ? "Ver foto anterior" : "Ver foto siguiente");
    button.innerHTML = direction === "prev" ? "&#8249;" : "&#8250;";
    return button;
}

function ensureGalleryControls(container) {
    const wrapper = container?.closest(".gallery-wrapper");
    if (!wrapper) return { wrapper: null, prevButton: null, nextButton: null };

    let prevButton = wrapper.querySelector('.gallery-nav-button-prev');
    let nextButton = wrapper.querySelector('.gallery-nav-button-next');

    if (!prevButton) {
        prevButton = createNavButton("prev");
        wrapper.appendChild(prevButton);
    }

    if (!nextButton) {
        nextButton = createNavButton("next");
        wrapper.appendChild(nextButton);
    }

    return { wrapper, prevButton, nextButton };
}

function getScrollStep(container) {
    const firstItem = container?.querySelector('.gallery-item');
    if (!firstItem) return 320;

    const itemWidth = firstItem.getBoundingClientRect().width;
    const styles = window.getComputedStyle(container);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return itemWidth + gap;
}

function updateNavButtons(container, prevButton, nextButton) {
    if (!container || !prevButton || !nextButton) return;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth - 2);
    prevButton.disabled = container.scrollLeft <= 2;
    nextButton.disabled = container.scrollLeft >= maxScrollLeft;

    const hideButtons = container.scrollWidth <= container.clientWidth + 8;
    prevButton.classList.toggle('hidden', hideButtons);
    nextButton.classList.toggle('hidden', hideButtons);
}

function scrollGalleryByStep(container, direction) {
    const step = getScrollStep(container);
    container.scrollBy({
        left: direction === 'prev' ? -step : step,
        behavior: 'smooth'
    });
}

function setupGalleryControls(container) {
    if (!container || container.dataset.controlsReady === 'true') return;

    const { prevButton, nextButton } = ensureGalleryControls(container);

    prevButton?.addEventListener('click', () => scrollGalleryByStep(container, 'prev'));
    nextButton?.addEventListener('click', () => scrollGalleryByStep(container, 'next'));

    const refreshButtons = () => {
        updateNavButtons(container, prevButton, nextButton);
        updateActiveGalleryItem(container);
    };

    container.addEventListener('scroll', refreshButtons, { passive: true });
    window.addEventListener('resize', refreshButtons);

    requestAnimationFrame(() => {
        refreshButtons();
        window.setTimeout(refreshButtons, 60);
    });

    container.dataset.controlsReady = 'true';
}

function setupGalleryDrag(container) {
    if (!container || container.dataset.dragReady === 'true') return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const stopDrag = () => {
        if (!isDragging) return;

        isDragging = false;
        container.classList.remove('is-dragging');

        if (moved) {
            container.dataset.justDragged = 'true';
            window.setTimeout(() => {
                delete container.dataset.justDragged;
            }, 260);
        }

        moved = false;
        requestAnimationFrame(() => {
            updateActiveGalleryItem(container);
        });
    };

    container.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;

        isDragging = true;
        startX = event.clientX;
        startScrollLeft = container.scrollLeft;
        moved = false;
        container.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - startX;
        if (Math.abs(deltaX) > 10) {
            moved = true;
        }

        if (!moved) return;

        event.preventDefault();
        container.scrollLeft = startScrollLeft - deltaX;
    });

    window.addEventListener('mouseup', stopDrag);
    container.addEventListener('mouseleave', stopDrag);

    container.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    container.dataset.dragReady = 'true';
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
        els.gallerySection.classList.add('hidden');
        return;
    }

    const fragment = document.createDocumentFragment();
    validImages.forEach((src, index) => {
        fragment.appendChild(createGalleryItem(src, index, els));
    });

    els.gallery.appendChild(fragment);
    setupGalleryControls(els.gallery);
    setupGalleryDrag(els.gallery);
    els.gallerySection.classList.remove('hidden');

    if (validImages.length > 1) {
        requestAnimationFrame(() => {
            const firstItem = els.gallery.querySelector('[data-gallery-index="0"]');
            centerGalleryItem(firstItem, 'auto');
            updateActiveGalleryItem(els.gallery);
        });
    } else {
        requestAnimationFrame(() => {
            updateActiveGalleryItem(els.gallery);
        });
    }

    if (els.gallery.dataset.restoreListenerReady !== 'true') {
        document.addEventListener('lightbox:closed', (event) => {
            restoreCenteredItem(els.gallery, event.detail?.galleryIndex);
        });

        els.gallery.dataset.restoreListenerReady = 'true';
    }
}