function normalizeGiftText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeGiftLabel(label) {
    const normalized = label
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    const knownLabels = {
        alias: "Alias",
        cbu: "CBU",
        cvu: "CVU",
        entidad: "Entidad",
        banco: "Banco",
        titular: "Titular"
    };

    return knownLabels[normalized] || label.trim();
}

function isGiftAccountHeading(line) {
    const normalized = line
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    return /^cuenta\b/.test(normalized) &&
        /(peso|dolar|ars|usd)/.test(normalized);
}

function parseGiftBankData(rawText) {
    const text = normalizeGiftText(rawText);

    if (!text) {
        return { accounts: [], rows: [] };
    }

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const accounts = [];
    const rows = [];
    let currentAccount = null;

    lines.forEach(line => {
        if (isGiftAccountHeading(line)) {
            currentAccount = {
                title: line.replace(/\s*:\s*$/, ""),
                rows: []
            };

            accounts.push(currentAccount);
            return;
        }

        const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
        const dashMatch = !colonMatch
            ? line.match(/^([^-]+)-\s*(.+)$/)
            : null;

        const match = colonMatch || dashMatch;

        const row = match ? { label: normalizeGiftLabel(match[1]), value: match[2].trim() } : { label: "Dato", value: line };

        if (currentAccount) {
            currentAccount.rows.push(row);
        } else {
            rows.push(row);
        }
    });

    return {
        accounts: accounts.filter(account =>
            account.rows.some(row => row.value)
        ),
        rows: rows.filter(row => row.value)
    };
}

function createGiftDataRow(row) {
    const article = document.createElement("article");
    article.className = "gift-data-row";

    const label = document.createElement("p");
    label.className = "gift-data-label";
    label.textContent = row.label || "Dato";

    const value = document.createElement("p");
    value.className = "gift-data-value";
    value.textContent = row.value || "";

    article.append(label, value);

    return article;
}

function renderGiftRows(container, parsedData) {
    if (!container) return;

    container.replaceChildren();

    const accounts = Array.isArray(parsedData?.accounts)
        ? parsedData.accounts
        : [];

    const rows = Array.isArray(parsedData?.rows)
        ? parsedData.rows
        : [];

    const fragment = document.createDocumentFragment();

    accounts.forEach(account => {
        const visibleRows = account.rows.filter(row => row?.value);

        if (!visibleRows.length) return;

        const section = document.createElement("section");
        section.className = "gift-bank-account";

        const heading = document.createElement("h5");
        heading.className = "gift-bank-account-title";
        heading.textContent = account.title;

        const fields = document.createElement("div");
        fields.className = "gift-bank-account-fields";

        visibleRows.forEach(row => {
            fields.appendChild(createGiftDataRow(row));
        });

        section.append(heading, fields);
        fragment.appendChild(section);
    });

    if (rows.length) {
        const looseFields = document.createElement("div");
        looseFields.className = "gift-bank-account-fields gift-bank-loose-fields";

        rows.forEach(row => {
            looseFields.appendChild(createGiftDataRow(row));
        });

        fragment.appendChild(looseFields);
    }

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
                setGiftFeedback(els, "Copiamos los datos para que puedas pegarlos directamente en tu app bancaria.", "success");
            } catch (error) {
                setGiftFeedback(
                    els,
                    "No pudimos copiar automáticamente desde este navegador. Igual te dejamos todos los datos visibles acá abajo.",
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
        data.giftIntro || "Tu presencia ya es un regalo enorme. Si además querés acompañarnos con un detalle, podés ayudarnos con nuestra luna de miel.";
    const rawText = normalizeGiftText(data.giftBankData);
    const parsedData = parseGiftBankData(rawText);

    const hasStructuredData = parsedData.accounts.length > 0 || parsedData.rows.length > 0;
    const hasBankData = rawText !== "";

    if (els.giftTitle) {
        els.giftTitle.textContent = giftTitle;
    }

    if (els.giftIntro) {
        els.giftIntro.textContent = giftIntro;
    }

    if (els.giftBankStructured) {
        renderGiftRows(els.giftBankStructured, parsedData);
    }

    if (els.giftBankData) {
        els.giftBankData.textContent = rawText;
        els.giftBankData.classList.toggle("hidden", hasStructuredData || !hasBankData);
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
