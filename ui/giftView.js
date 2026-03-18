export function renderGift(els, data) {
    if (els.giftTitle) {
        els.giftTitle.textContent = data.giftTitle || "Aporte para luna de miel";
    }

    if (els.giftIntro) {
        els.giftIntro.textContent =
            data.giftIntro || "Si querés hacernos un regalo, podés colaborar con nuestra luna de miel.";
    }

    if (els.giftBankData) {
        const hasBankData = typeof data.giftBankData === "string" && data.giftBankData.trim() !== "";
        els.giftBankData.textContent = hasBankData ? data.giftBankData : "";
        els.giftBankData.classList.toggle("hidden", !hasBankData);
    }
}