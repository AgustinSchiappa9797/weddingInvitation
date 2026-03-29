import { openLightbox } from "./lightboxView.js";

const LOOP_CLONES_PER_SIDE = 2;
const SCROLL_SETTLE_DELAY_MS = 140;

function isSafeImageUrl(value) {
    try {
        const url = new URL(value, window.location.href);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function getCloneCount(imagesLength) {
    if (imagesLength <= 1) return 0;
    return Math.min(LOOP_CLONES_PER_SIDE, imagesLength);
}

function buildLoopedGalleryImages(images) {
    if (!Array.isArray(images) || images.length === 0) {
        return [];
    }

    if (images.length === 1) {
        return images.map((src, index) => ({
            src,
            logicalIndex: index,
            isClone: false
        }));
    }

    const cloneCount = getCloneCount(images.length);
    const leadingClones = images.slice(-cloneCount).map((src, offset) => ({
        src,
        logicalIndex: images.length - cloneCount + offset,
        isClone: true
    }));

    const trailingClones = images.slice(0, cloneCount).map((src, logicalIndex) => ({
        src,
        logicalIndex,
        isClone: true
    }));

    return [
        ...leadingClones,
        ...images.map((src, index) => ({
            src,
            logicalIndex: index,
            isClone: false
        })),
        ...trailingClones
    ];
}

function getGalleryItems(container) {
    return [...container.querySelectorAll(".gallery-item")];
}

function getRealGalleryItems(container) {
    return getGalleryItems(container).filter((item) => item.dataset.clone !== "true");
}

function getClosestGalleryItem(container) {
    if (!container) return null;

    const items = getGalleryItems(container);
    if (!items.length) return null;

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

    return closestItem;
}

function centerGalleryItem(container, item, behavior = "smooth") {
    if (!container || !item) return;

    const targetLeft = item.offsetLeft - ((container.clientWidth - item.offsetWidth) / 2);
    container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior
    });
}

function getActiveLogicalIndex(container) {
    const activeItem = getClosestGalleryItem(container);
    if (!activeItem) return 0;

    const logicalIndex = Number.parseInt(activeItem.dataset.galleryIndex || "0", 10);
    return Number.isInteger(logicalIndex) ? logicalIndex : 0;
}

function formatGalleryCounter(index, total) {
    const safeTotal = Math.max(1, total);
    const safeIndex = Math.min(safeTotal, Math.max(1, index + 1));
    return `${String(safeIndex).padStart(2, "0")} / ${String(safeTotal).padStart(2, "0")}`;
}

function updateGalleryCounter(els, container) {
    if (!els.galleryCounter || !container) return;

    const total = getRealGalleryItems(container).length;
    if (!total) {
        els.galleryCounter.textContent = "";
        els.galleryCounter.classList.add("hidden");
        return;
    }

    const activeIndex = getActiveLogicalIndex(container);
    els.galleryCounter.textContent = formatGalleryCounter(activeIndex, total);
    els.galleryCounter.classList.toggle("hidden", total <= 1);
}

function updateActiveGalleryItem(container, els = null) {
    if (!container) return;

    const items = getGalleryItems(container);
    if (!items.length) return;

    const activeLogicalIndex = String(getActiveLogicalIndex(container));

    items.forEach((item) => {
        const isActive = item.dataset.galleryIndex === activeLogicalIndex && item.dataset.clone !== "true";
        item.classList.toggle("is-active", isActive);
    });

    if (els) {
        updateGalleryCounter(els, container);
    }
}

function getRealItemByLogicalIndex(container, logicalIndex) {
    return container?.querySelector(
        `.gallery-item[data-gallery-index="${logicalIndex}"][data-clone="false"]`
    ) || null;
}

function getFirstRealItem(container) {
    return container?.querySelector('.gallery-item[data-clone="false"]') || null;
}

function normalizeLoopPosition(container) {
    if (!container) return;

    const closestItem = getClosestGalleryItem(container);
    if (!closestItem || closestItem.dataset.clone !== "true") return;

    const logicalIndex = Number.parseInt(closestItem.dataset.galleryIndex || "-1", 10);
    if (!Number.isInteger(logicalIndex) || logicalIndex < 0) return;

    const realItem = getRealItemByLogicalIndex(container, logicalIndex);
    if (!realItem) return;

    centerGalleryItem(container, realItem, "auto");
}

function createGalleryItem(src, logicalIndex, totalImages, isClone, cloneSide, els) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.dataset.galleryIndex = String(logicalIndex);
    button.dataset.clone = isClone ? "true" : "false";

    if (isClone && cloneSide) {
        button.dataset.side = cloneSide;
    }

    button.setAttribute("aria-label", `Abrir foto ${logicalIndex + 1} de ${totalImages}`);

    const frame = document.createElement("span");
    frame.className = "gallery-item-frame";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Foto de la invitación ${logicalIndex + 1}`;
    img.loading = !isClone && logicalIndex < 2 ? "eager" : "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.referrerPolicy = "no-referrer";

    const meta = document.createElement("span");
    meta.className = "gallery-item-meta";
    meta.textContent = `Foto ${String(logicalIndex + 1).padStart(2, "0")}`;

    frame.append(img, meta);
    button.appendChild(frame);

    button.addEventListener("click", (event) => {
        const gallery = els.gallery;
        if (!gallery || gallery.dataset.justDragged === "true") {
            event.preventDefault();
            return;
        }

        const realItem = getRealItemByLogicalIndex(gallery, logicalIndex) || button;
        centerGalleryItem(gallery, realItem);
        updateActiveGalleryItem(gallery, els);
        updateGalleryDots(gallery);

        openLightbox(els, src, img.alt, {
            triggerElement: realItem,
            galleryIndex: logicalIndex
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
    let wrapper = container?.closest(".gallery-wrapper");
    if (!wrapper && container?.parentElement) {
        wrapper = document.createElement("div");
        wrapper.className = "gallery-wrapper";
        container.parentElement.insertBefore(wrapper, container);
        wrapper.appendChild(container);
    }

    if (!wrapper) {
        return {
            wrapper: null,
            prevButton: null,
            nextButton: null,
            dotsContainer: null
        };
    }

    let prevButton = wrapper.querySelector(".gallery-nav-button-prev");
    let nextButton = wrapper.querySelector(".gallery-nav-button-next");
    let dotsContainer = wrapper.querySelector(".gallery-dots");

    if (!prevButton) {
        prevButton = createNavButton("prev");
        wrapper.appendChild(prevButton);
    }

    if (!nextButton) {
        nextButton = createNavButton("next");
        wrapper.appendChild(nextButton);
    }

    if (!dotsContainer) {
        dotsContainer = document.createElement("div");
        dotsContainer.className = "gallery-dots";
        dotsContainer.setAttribute("aria-label", "Indicadores de galería");
        wrapper.appendChild(dotsContainer);
    }

    return { wrapper, prevButton, nextButton, dotsContainer };
}

function updateNavButtons(container, prevButton, nextButton) {
    if (!container || !prevButton || !nextButton) return;

    const realItems = getRealGalleryItems(container);
    const hideButtons = realItems.length <= 1;

    prevButton.disabled = hideButtons;
    nextButton.disabled = hideButtons;
    prevButton.classList.toggle("hidden", hideButtons);
    nextButton.classList.toggle("hidden", hideButtons);
}

function createDotButton(index, total, container, els) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-dot";
    button.dataset.galleryDotIndex = String(index);
    button.setAttribute("aria-label", `Ir a foto ${index + 1} de ${total}`);

    button.addEventListener("click", () => {
        const targetItem = getRealItemByLogicalIndex(container, index);
        if (!targetItem) return;

        centerGalleryItem(container, targetItem, "smooth");
        updateActiveGalleryItem(container, els);
        updateGalleryDots(container);
    });

    return button;
}

function renderGalleryDots(container, totalImages, dotsContainer, els) {
    if (!container || !dotsContainer) return;

    dotsContainer.replaceChildren();

    if (totalImages <= 1) {
        dotsContainer.classList.add("hidden");
        return;
    }

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < totalImages; index += 1) {
        fragment.appendChild(createDotButton(index, totalImages, container, els));
    }

    dotsContainer.appendChild(fragment);
    dotsContainer.classList.remove("hidden");
}

function updateGalleryDots(container) {
    if (!container) return;

    const wrapper = container.closest(".gallery-wrapper");
    const dots = [...(wrapper?.querySelectorAll(".gallery-dot") || [])];
    if (!dots.length) return;

    const activeIndex = String(getActiveLogicalIndex(container));

    dots.forEach((dot) => {
        const isActive = dot.dataset.galleryDotIndex === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
}

function scrollGalleryByStep(container, direction, els) {
    const realItems = getRealGalleryItems(container);
    if (!container || realItems.length <= 1) return;

    const currentIndex = getActiveLogicalIndex(container);
    const lastIndex = realItems.length - 1;

    let nextIndex = currentIndex;

    if (direction === "prev") {
        nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
    } else {
        nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
    }

    const targetItem = getRealItemByLogicalIndex(container, nextIndex);
    if (!targetItem) return;

    centerGalleryItem(container, targetItem, "smooth");

    window.clearTimeout(container._galleryNormalizeTimeoutId);
    container._galleryNormalizeTimeoutId = window.setTimeout(() => {
        normalizeLoopPosition(container);
        updateActiveGalleryItem(container, els);
        updateGalleryDots(container);
    }, SCROLL_SETTLE_DELAY_MS + 120);
}

function scheduleScrollSettle(container, callback) {
    window.clearTimeout(container._galleryScrollSettleTimeoutId);
    container._galleryScrollSettleTimeoutId = window.setTimeout(() => {
        callback();
    }, SCROLL_SETTLE_DELAY_MS);
}

function setupGalleryControls(container, totalImages, els) {
    if (!container) return;

    const { prevButton, nextButton, dotsContainer } = ensureGalleryControls(container);

    renderGalleryDots(container, totalImages, dotsContainer, els);

    if (container.dataset.controlsReady !== "true") {
        prevButton?.addEventListener("click", () => scrollGalleryByStep(container, "prev", els));
        nextButton?.addEventListener("click", () => scrollGalleryByStep(container, "next", els));

        const refreshButtons = () => {
            updateNavButtons(container, prevButton, nextButton);
            updateActiveGalleryItem(container, els);
            updateGalleryDots(container);

            if (container.dataset.dragging !== "true") {
                scheduleScrollSettle(container, () => {
                    normalizeLoopPosition(container);
                    updateActiveGalleryItem(container, els);
                    updateGalleryDots(container);
                });
            }
        };

        container.addEventListener("scroll", refreshButtons, { passive: true });
        window.addEventListener("resize", () => {
            normalizeLoopPosition(container);
            updateNavButtons(container, prevButton, nextButton);
            updateActiveGalleryItem(container, els);
            updateGalleryDots(container);
        });

        requestAnimationFrame(() => {
            refreshButtons();
            window.setTimeout(refreshButtons, 60);
        });

        container.dataset.controlsReady = "true";
        return;
    }

    requestAnimationFrame(() => {
        updateNavButtons(container, prevButton, nextButton);
        updateActiveGalleryItem(container, els);
        updateGalleryDots(container);
    });
}

function setupGalleryDrag(container, els) {
    if (!container || container.dataset.dragReady === "true") return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const stopDrag = () => {
        if (!isDragging) return;

        isDragging = false;
        container.dataset.dragging = "false";
        container.classList.remove("is-dragging");

        if (moved) {
            container.dataset.justDragged = "true";
            window.setTimeout(() => {
                delete container.dataset.justDragged;
            }, 260);
        }

        moved = false;

        requestAnimationFrame(() => {
            normalizeLoopPosition(container);
            updateActiveGalleryItem(container, els);
            updateGalleryDots(container);
        });
    };

    container.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;

        isDragging = true;
        container.dataset.dragging = "true";
        startX = event.clientX;
        startScrollLeft = container.scrollLeft;
        moved = false;
        container.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - startX;
        if (Math.abs(deltaX) > 10) {
            moved = true;
        }

        if (!moved) return;

        event.preventDefault();
        container.scrollLeft = startScrollLeft - deltaX;
    });

    window.addEventListener("mouseup", stopDrag);
    container.addEventListener("mouseleave", stopDrag);

    container.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    container.dataset.dragReady = "true";
}

function restoreCenteredItem(container, logicalIndex, els) {
    if (!container || !Number.isInteger(logicalIndex)) return;

    const item = getRealItemByLogicalIndex(container, logicalIndex);
    if (!item) return;

    requestAnimationFrame(() => {
        centerGalleryItem(container, item);
        item.focus?.({ preventScroll: true });
        updateActiveGalleryItem(container, els);
        updateGalleryDots(container);
    });
}

function getGalleryIntroText(data, totalImages) {
    if (data?.galleryIntroText && typeof data.galleryIntroText === "string" && data.galleryIntroText.trim()) {
        return data.galleryIntroText.trim();
    }

    if (totalImages <= 1) {
        return "Un recuerdo especial que queremos compartir con vos.";
    }

    return "Algunos recuerdos que nos trajeron hasta acá.";
}

export function renderGallery(els, data) {
    if (!els.gallerySection || !els.gallery) return;

    els.gallery.replaceChildren();
    delete els.gallery.dataset.dragging;

    const validImages = Array.isArray(data.gallery)
        ? data.gallery.filter(isSafeImageUrl)
        : [];

    if (validImages.length === 0) {
        els.gallerySection.classList.add("hidden");
        if (els.galleryCounter) {
            els.galleryCounter.classList.add("hidden");
        }
        return;
    }

    if (els.galleryIntroText) {
        els.galleryIntroText.textContent = getGalleryIntroText(data, validImages.length);
    }

    const cloneCount = getCloneCount(validImages.length);
    const visualImages = buildLoopedGalleryImages(validImages);
    const fragment = document.createDocumentFragment();

    visualImages.forEach(({ src, logicalIndex, isClone }, visualIndex) => {
        let cloneSide = "";

        if (isClone) {
            cloneSide = visualIndex < cloneCount ? "leading" : "trailing";
        }

        fragment.appendChild(
            createGalleryItem(src, logicalIndex, validImages.length, isClone, cloneSide, els)
        );
    });

    els.gallery.appendChild(fragment);
    setupGalleryControls(els.gallery, validImages.length, els);
    setupGalleryDrag(els.gallery, els);
    els.gallerySection.classList.remove("hidden");

    requestAnimationFrame(() => {
        const firstRealItem = getFirstRealItem(els.gallery);
        if (firstRealItem) {
            centerGalleryItem(els.gallery, firstRealItem, "auto");
        }

        updateActiveGalleryItem(els.gallery, els);
        updateGalleryDots(els.gallery);
    });

    if (els.gallery.dataset.restoreListenerReady !== "true") {
        document.addEventListener("lightbox:closed", (event) => {
            restoreCenteredItem(els.gallery, event.detail?.galleryIndex, els);
        });

        els.gallery.dataset.restoreListenerReady = "true";
    }
}