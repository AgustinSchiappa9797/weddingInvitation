function normalizeGiftText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function parseGiftBankData(rawText) {
    const text = normalizeGiftText(rawText);
    if (!text) return [];

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const parsed = [];

    lines.forEach((line) => {
        const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch) {
            parsed.push({
                label: colonMatch[1].trim(),
                value: colonMatch[2].trim()
            });
            return;
        }

        const dashMatch = line.match(/^([^-]+)-\s*(.+)$/);
        if (dashMatch) {
            parsed.push({
                label: dashMatch[1].trim(),
                value: dashMatch[2].trim()
            });
            return;
        }

        parsed.push({
            label: "Dato",
            value: line
        });
    });

    return parsed;
}

function renderGiftRows(container, rows) {
    if (!container) return;

    container.replaceChildren();

    const visibleRows = Array.isArray(rows) ? rows.filter((row) => row?.value) : [];
    if (!visibleRows.length) return;

    const fragment = document.createDocumentFragment();

    visibleRows.forEach((row) => {
        const article = document.createElement("article");
        article.className = "gift-data-row";

        const label = document.createElement("p");
        label.className = "gift-data-label";
        label.textContent = row.label || "Dato";

        const value = document.createElement("p");
        value.className = "gift-data-value";
        value.textContent = row.value || "";

        article.append(label, value);
        fragment.appendChild(article);
    });

    container.appendChild(fragment);
}

function setGiftFeedback(els, message, state = "info") {
    if (!els.giftFeedback) return;

    els.giftFeedback.textContent = message || "";
    els.giftFeedback.dataset.state = state;
    els.giftFeedback.classList.toggle("hidden", !message);
}

async function copyGiftData(text) {
    if (!navigator.clipboard?.writeText) {
        throw new Error("COPY_NOT_SUPPORTED");
    }

    await navigator.clipboard.writeText(text);
}

async function shareGiftData(text) {
    if (!navigator.share) {
        throw new Error("SHARE_NOT_SUPPORTED");
    }

    await navigator.share({
        title: "Datos para regalo",
        text
    });
}

function setupGiftActions(els, rawText) {
    if (els.giftCopyButton && els.giftCopyButton.dataset.bound !== "true") {
        els.giftCopyButton.addEventListener("click", async () => {
            try {
                await copyGiftData(rawText);
                setGiftFeedback(els, "Copiamos todos los datos para que puedas pegarlos donde quieras.", "success");
            } catch (error) {
                setGiftFeedback(
                    els,
                    "No pudimos copiar automáticamente desde este navegador. Igual te dejamos los datos visibles más abajo.",
                    "error"
                );
            }
        });

        els.giftCopyButton.dataset.bound = "true";
    }

    if (els.giftShareButton && els.giftShareButton.dataset.bound !== "true") {
        els.giftShareButton.addEventListener("click", async () => {
            try {
                await shareGiftData(rawText);
                setGiftFeedback(els, "Abrimos la ventana para compartir los datos.", "success");
            } catch (error) {
                if (error?.message === "SHARE_NOT_SUPPORTED") {
                    try {
                        await copyGiftData(rawText);
                        setGiftFeedback(
                            els,
                            "Tu navegador no permite compartir directo, así que copiamos los datos al portapapeles.",
                            "success"
                        );
                    } catch {
                        setGiftFeedback(
                            els,
                            "No pudimos compartir automáticamente, pero los datos siguen disponibles en pantalla.",
                            "error"
                        );
                    }
                    return;
                }

                setGiftFeedback(els, "No pudimos abrir la opción de compartir en este momento.", "error");
            }
        });

        els.giftShareButton.dataset.bound = "true";
    }
}

export function renderGift(els, data) {
    const giftTitle = data.giftTitle || "Aporte para luna de miel";
    const giftIntro =
        data.giftIntro || "Si querés hacernos un regalo, podés colaborar con nuestra luna de miel.";
    const rawText = normalizeGiftText(data.giftBankData);
    const parsedRows = parseGiftBankData(rawText);
    const hasBankData = rawText !== "";

    if (els.giftTitle) {
        els.giftTitle.textContent = giftTitle;
    }

    if (els.giftIntro) {
        els.giftIntro.textContent = giftIntro;
    }

    if (els.giftBankStructured) {
        renderGiftRows(els.giftBankStructured, parsedRows);
    }

    if (els.giftBankData) {
        els.giftBankData.textContent = rawText;
        els.giftBankData.classList.toggle("hidden", parsedRows.length > 0 || !hasBankData);
    }

    if (els.giftDataCard) {
        els.giftDataCard.classList.toggle("hidden", !hasBankData);
    }

    if (els.giftCopyButton) {
        els.giftCopyButton.disabled = !hasBankData;
    }

    if (els.giftShareButton) {
        els.giftShareButton.disabled = !hasBankData;
    }

    setGiftFeedback(els, "", "info");

    if (hasBankData) {
        setupGiftActions(els, rawText);
    }
}