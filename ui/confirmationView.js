import { submitConfirmation } from "../api/confirmationApi.js";
import { mergeInvitationConfirmationCache } from "../api/invitationApi.js";
import { updateHeroPrimaryAction, updateHeroRsvpState } from "./heroView.js";
import { COPY } from "../constants/copy.js";
import { goToSection } from "./navigation.js";

function syncKidsInfoFieldVisibility(els, data = null) {
    const status = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const isAttending = status === "yes";

    const kidsAllowedFromData = Boolean(data?.grammar?.kidsAllowed);
    const kidsAllowedFromForm = els.confirmationForm?.dataset.kidsAllowed === "true";
    const kidsAllowed = kidsAllowedFromData || kidsAllowedFromForm;

    const shouldShow = isAttending && kidsAllowed;

    els.confirmationKidsInfoField?.classList.toggle("hidden", !shouldShow);

    if (els.confirmationKidsInfo) {
        els.confirmationKidsInfo.disabled = !shouldShow;
    }
}

function getSelectedAttendingCount(els) {
    const status = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    if (status !== "yes") return 0;

    const companions = Number.parseInt(els.confirmationForm?.dataset.companions || "1", 10);
    if (companions <= 1) return 1;

    return Math.max(1, Number.parseInt(els.confirmationCount?.value || "1", 10));
}

function getGuestNameInputs(els) {
    return Array.from(els.confirmationGuestNamesList?.querySelectorAll('input[data-guest-name-input="true"]') || []);
}

function extractGuestNamesFromComment(comment = "") {
    if (!comment) {
        return { cleanComment: "", guestNames: [] };
    }

    const namesMatch = comment.match(/(?:^|\n\n)Asistentes:\s*([\s\S]*?)(?=(?:\n\nInfo chicos:)|$)/i);
    if (!namesMatch) {
        return { cleanComment: comment, guestNames: [] };
    }

    const guestNames = namesMatch[1]
        .split(/\n+/)
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean);

    const cleanComment = comment
        .replace(/(?:^|\n\n)Asistentes:\s*[\s\S]*?(?=(?:\n\nInfo chicos:)|$)/i, "")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\n{3,}/g, "\n\n");

    return { cleanComment, guestNames };
}

function renderGuestNameFields(els, count, existingNames = []) {
    if (!els.confirmationGuestNamesList) return;

    els.confirmationGuestNamesList.replaceChildren();

    for (let index = 0; index < count; index += 1) {
        const wrap = document.createElement("div");
        wrap.className = "confirmation-guest-name-item";

        const label = document.createElement("label");
        label.htmlFor = `confirmationGuestName${index + 1}`;
        label.textContent = `Nombre y apellido ${index + 1}`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `confirmationGuestName${index + 1}`;
        input.placeholder = "Ej.: Juan Pérez";
        input.autocomplete = "name";
        input.dataset.guestNameInput = "true";
        input.value = existingNames[index] || "";

        wrap.append(label, input);
        els.confirmationGuestNamesList.appendChild(wrap);
    }
}

function syncGuestNamesFieldVisibility(els) {
    const attendingCount = getSelectedAttendingCount(els);
    const shouldShow = attendingCount > 1;

    els.confirmationGuestNamesField?.classList.toggle("hidden", !shouldShow);

    const currentInputs = getGuestNameInputs(els);
    if (shouldShow && currentInputs.length !== attendingCount) {
        const preservedValues = currentInputs.map((input) => input.value.trim()).filter(Boolean);
        const existingValues = preservedValues.length ? preservedValues : (() => {
            try {
                return JSON.parse(els.confirmationForm?.dataset.attendeeNames || "[]");
            } catch {
                return [];
            }
        })();
        renderGuestNameFields(els, attendingCount, existingValues);
    }

    getGuestNameInputs(els).forEach((input) => {
        input.disabled = !shouldShow;
    });

    if (!shouldShow) {
        try {
            els.confirmationForm.dataset.attendeeNames = "[]";
        } catch {
        }
    }
}

function syncProgressStepVisibility(els) {
    const companions = Number.parseInt(els.confirmationForm?.dataset.companions || "1", 10);
    const shouldShowCountStep = companions > 1;
    const visibleSteps = [
        els.progressStepStatus,
        shouldShowCountStep ? els.progressStepCount : null,
        els.progressStepDetails
    ].filter(Boolean);

    els.progressStepCount?.classList.toggle("hidden", !shouldShowCountStep);
    if (els.confirmationProgress) {
        els.confirmationProgress.style.gridTemplateColumns = `repeat(${visibleSteps.length}, minmax(0, 1fr))`;
    }

    visibleSteps.forEach((el, index) => {
        const indexNode = el.querySelector(".confirmation-progress-index");
        if (indexNode) indexNode.textContent = String(index + 1);
        el.dataset.step = String(index + 1);
    });
}

function renderConfirmationCopy(els, data) {
    if (els.rsvpIntroText) {
        els.rsvpIntroText.textContent =
            data.rsvpIntro || COPY.rsvp.intro({ isPlural: false });
    }

    if (els.confirmationLegend) {
        els.confirmationLegend.textContent = data.rsvpLegend || "¿Podrás acompañarnos?";
    }

    if (els.confirmationKidsInfoLabel) {
        els.confirmationKidsInfoLabel.textContent =
            data.rsvpKidsInfoLabel || "Si vienen con chicos, contanos sus edades o cualquier dato útil";
    }

    if (els.confirmationKidsInfo) {
        els.confirmationKidsInfo.placeholder =
            data.rsvpKidsInfoPlaceholder || "Ej.: Olivia (3) y Benja (6), una necesita menú especial";
    }

    if (els.confirmationYesTitle) {
        els.confirmationYesTitle.textContent = data.rsvpYesTitle || "Sí, asistiré";
    }

    if (els.confirmationYesHint) {
        els.confirmationYesHint.textContent = data.rsvpYesHint || "Así podremos reservar tu lugar.";
    }

    if (els.confirmationNoTitle) {
        els.confirmationNoTitle.textContent = data.rsvpNoTitle || "No podré asistir";
    }

    if (els.confirmationNoHint) {
        els.confirmationNoHint.textContent = data.rsvpNoHint || "Igualmente nos encantará saber de vos.";
    }

    if (els.confirmationCountLabel) {
        els.confirmationCountLabel.textContent = data.rsvpCountLabel || "¿Cuántas personas asistirán?";
    }

    if (els.confirmationGuestNamesLabel) {
        els.confirmationGuestNamesLabel.textContent = data.rsvpGuestNamesLabel || "¿Quiénes asistirán?";
    }

    if (els.confirmationGuestNamesHelper) {
        els.confirmationGuestNamesHelper.textContent = data.rsvpGuestNamesHelper || "Escribí nombre y apellido de cada persona que va a asistir.";
    }

    if (els.confirmationDietaryLabel) {
        els.confirmationDietaryLabel.textContent = data.rsvpDietaryLabel || "Restricciones alimentarias";
    }

    if (els.confirmationDietaryRestrictions) {
        els.confirmationDietaryRestrictions.placeholder =
            data.rsvpDietaryPlaceholder || "Ej.: 1 vegetariano, 1 celíaco";
    }

    if (els.confirmationCommentLabel) {
        els.confirmationCommentLabel.textContent = data.rsvpCommentLabel || "Comentario";
    }

    if (els.confirmationComment) {
        els.confirmationComment.placeholder =
            data.rsvpCommentPlaceholder || "Podés dejarnos una nota si lo necesitás.";
    }
}

function getGrammarFromForm(els) {
    return {
        isPlural: els.confirmationForm?.dataset.isPlural === "true"
    };
}

function isConfirmationClosed(data) {
    const raw = data?.confirmationDeadlineIso || data?.rsvpDeadlineIso || "";
    if (!raw) return false;

    const deadline = new Date(raw);
    if (Number.isNaN(deadline.getTime())) return false;

    return Date.now() > deadline.getTime();
}

function setFeedback(els, message, type = "info") {
    if (!els.confirmationFeedback) return;

    els.confirmationFeedback.textContent = message || "";
    els.confirmationFeedback.classList.toggle("hidden", !message);
    els.confirmationFeedback.dataset.state = type;

    if (message) {
        requestAnimationFrame(() => {
            els.confirmationFeedback.focus?.({ preventScroll: false });
        });
    }
}

function setSubmitLoading(els, loading, hasExistingConfirmation = false) {
    if (!els.confirmationSubmitButton) return;

    els.confirmationSubmitButton.classList.toggle("is-loading", loading);
    els.confirmationSubmitButton.disabled = loading;
    els.confirmationSubmitButton.textContent = loading
        ? "Guardando confirmación…"
        : hasExistingConfirmation
            ? COPY.rsvp.submitUpdate
            : COPY.rsvp.submitNew;
}

function setFormDisabled(els, disabled) {
    const controls = [
        els.confirmationCount,
        els.confirmationDietaryRestrictions,
        els.confirmationComment,
        els.confirmationKidsInfo,
        ...getGuestNameInputs(els),
        ...Array.from(els.confirmationForm?.querySelectorAll('input[name="confirmationStatus"]') || [])
    ];

    controls.forEach((control) => {
        if (control) {
            control.disabled = disabled;
        }
    });
}

function syncCountFieldVisibility(els) {
    const status = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const isAttending = status === "yes";
    const companions = Number.parseInt(els.confirmationForm?.dataset.companions || "1", 10);
    const shouldShowCount = isAttending && companions > 1;

    els.confirmationCountField?.classList.toggle("hidden", !shouldShowCount);

    if (els.confirmationCount) {
        els.confirmationCount.disabled = !shouldShowCount;
    }
}

function populateCountOptions(select, companions, selectedValue) {
    if (!select) return;

    select.replaceChildren();

    for (let count = 1; count <= companions; count += 1) {
        const option = document.createElement("option");
        option.value = String(count);
        option.textContent = count === 1 ? "1 persona" : `${count} personas`;
        option.selected = count === selectedValue;
        select.appendChild(option);
    }
}

function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case "INVALID_TOKEN":
        case "INVITATION_NOT_FOUND":
            return "No pudimos validar esta invitación. Recargá la página e intentá de nuevo.";
        case "INVALID_STATUS":
            return "Elegí si podrán asistir o no antes de enviar la confirmación.";
        case "INVALID_ATTENDING_COUNT":
            return "Revisá la cantidad de personas antes de enviar la confirmación.";
        case "CONFIRMATION_CLOSED":
        case "RSVP_CLOSED":
            return "La confirmación ya se encuentra cerrada.";
        case "RATE_LIMITED":
            return "Se hicieron demasiados intentos seguidos. Esperá un momento y volvé a probar.";
        case "REQUEST_TIMEOUT":
            return "La confirmación tardó demasiado en responder. Intentá nuevamente en unos instantes.";
        default:
            return "No pudimos guardar la confirmación en este momento. Volvé a intentarlo.";
    }
}

function extractKidsInfoFromComment(comment = "") {
    if (!comment) {
        return { cleanComment: "", kidsInfo: "" };
    }

    const kidsMatch = comment.match(/(?:^|\n\n)Info chicos:\s*([\s\S]*)$/i);
    if (!kidsMatch) {
        return { cleanComment: comment, kidsInfo: "" };
    }

    const kidsInfo = kidsMatch[1].trim();
    const cleanComment = comment.replace(/(?:^|\n\n)Info chicos:\s*[\s\S]*$/i, "").trim();

    return { cleanComment, kidsInfo };
}

function buildPayload(els) {
    const status = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const companions = Number.parseInt(els.confirmationForm?.dataset.companions || "1", 10);

    const attendingCount = status === "yes"
        ? (companions <= 1
            ? 1
            : Number.parseInt(els.confirmationCount?.value || "0", 10))
        : 0;

    const comment = els.confirmationComment?.value?.trim() || "";
    const kidsInfo = els.confirmationKidsInfo?.value?.trim() || "";
    const attendeeNames = status === "yes"
        ? getGuestNameInputs(els).map((input) => input.value.trim()).filter(Boolean)
        : [];

    const mergedComment = [
        comment,
        attendeeNames.length > 1 ? `Asistentes:\n${attendeeNames.map((name) => `- ${name}`).join("\n")}` : "",
        kidsInfo ? `Info chicos: ${kidsInfo}` : ""
    ]
        .filter(Boolean)
        .join("\n\n");

    return {
        token: els.confirmationForm?.dataset.token || "",
        status,
        attendingCount,
        attendeeNames,
        dietaryRestrictions: els.confirmationDietaryRestrictions?.value?.trim() || "",
        comment: mergedComment
    };
}

function setSubmitButtonLabel(els, hasExistingConfirmation) {
    setSubmitLoading(els, false, hasExistingConfirmation);
}

function setHelperText(els, data) {
    if (!els.rsvpHelperText) return;

    if (data?.existingConfirmation) {
        els.rsvpHelperText.textContent = COPY.rsvp.helperExisting;
        return;
    }

    const raw = data?.confirmationDeadlineIso || data?.rsvpDeadlineIso || "";
    const deadline = new Date(raw);

    if (!Number.isNaN(deadline.getTime())) {
        const diff = deadline.getTime() - Date.now();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysLeft >= 0 && daysLeft <= 3) {
            els.rsvpHelperText.textContent = COPY.rsvp.helperUrgent;
            return;
        }
    }

    els.rsvpHelperText.textContent = COPY.rsvp.helperDefault;
}

function hydrateConfirmationForm(els, data) {
    const existing = data?.existingConfirmation || null;
    const companions = Number.isFinite(Number(data?.companions)) ? Math.max(1, Number(data.companions)) : 1;

    const yesInput = els.confirmationForm?.querySelector('input[name="confirmationStatus"][value="yes"]');
    const noInput = els.confirmationForm?.querySelector('input[name="confirmationStatus"][value="no"]');

    if (!existing) {
        if (yesInput) yesInput.checked = true;
        if (noInput) noInput.checked = false;

        if (els.confirmationDietaryRestrictions) els.confirmationDietaryRestrictions.value = "";
        if (els.confirmationComment) els.confirmationComment.value = "";
        if (els.confirmationKidsInfo) els.confirmationKidsInfo.value = "";
        try {
            els.confirmationForm.dataset.attendeeNames = "[]";
        } catch {
            // noop
        }
        populateCountOptions(els.confirmationCount, companions, 1);
        return;
    }

    const { cleanComment: commentWithoutKids, kidsInfo } = extractKidsInfoFromComment(existing.comment || "");
    const { cleanComment, guestNames } = extractGuestNamesFromComment(commentWithoutKids || "");
    const isAttending = existing.status === "yes";

    if (yesInput) yesInput.checked = isAttending;
    if (noInput) noInput.checked = !isAttending;

    const selectedCount = isAttending
        ? Math.min(companions, Math.max(1, Number(existing.attendingCount) || 1))
        : 1;

    populateCountOptions(els.confirmationCount, companions, selectedCount);

    if (els.confirmationDietaryRestrictions) {
        els.confirmationDietaryRestrictions.value = existing.dietaryRestrictions || "";
    }

    if (els.confirmationComment) {
        els.confirmationComment.value = cleanComment;
    }

    try {
        els.confirmationForm.dataset.attendeeNames = JSON.stringify(guestNames);
    } catch {
    }

    if (els.confirmationKidsInfo) {
        els.confirmationKidsInfo.value = kidsInfo;
    }
}

function renderConfirmationSummary(els, existingConfirmation) {
    if (!els.confirmationSummary) return;

    if (!existingConfirmation) {
        els.confirmationSummary.innerHTML = "";
        els.confirmationSummary.classList.add("hidden");
        return;
    }

    const dateText = (() => {
        const date = new Date(existingConfirmation.updatedAt || "");
        return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("es-AR");
    })();

    const summaryRows = [];
    const { cleanComment: summaryCommentWithoutKids, kidsInfo: summaryKidsInfo } = extractKidsInfoFromComment(existingConfirmation.comment || "");
    const { cleanComment: summaryComment, guestNames: summaryGuestNames } = extractGuestNamesFromComment(summaryCommentWithoutKids || "");

    if (existingConfirmation.status === "yes") {
        const count = Math.max(1, Number(existingConfirmation.attendingCount) || 1);
        summaryRows.push(`
            <div class="confirmation-summary-row">
                <span class="confirmation-summary-label">Estado</span>
                <strong class="confirmation-summary-value">Asistencia confirmada</strong>
            </div>
            <div class="confirmation-summary-row">
                <span class="confirmation-summary-label">Lugares reservados</span>
                <strong class="confirmation-summary-value">${count} persona${count === 1 ? "" : "s"}</strong>
            </div>
        `);
    } else {
        summaryRows.push(`
            <div class="confirmation-summary-row">
                <span class="confirmation-summary-label">Estado</span>
                <strong class="confirmation-summary-value">No asistirá</strong>
            </div>
        `);
    }

    if (summaryGuestNames.length > 1) {
        summaryRows.push(`
            <div class="confirmation-summary-row is-multiline">
                <span class="confirmation-summary-label">Asistentes</span>
                <span class="confirmation-summary-value">${summaryGuestNames.join("<br>")}</span>
            </div>
        `);
    }

    if (existingConfirmation.dietaryRestrictions) {
        summaryRows.push(`
            <div class="confirmation-summary-row is-multiline">
                <span class="confirmation-summary-label">Restricciones</span>
                <span class="confirmation-summary-value">${existingConfirmation.dietaryRestrictions}</span>
            </div>
        `);
    }

    if (summaryKidsInfo) {
        summaryRows.push(`
            <div class="confirmation-summary-row is-multiline">
                <span class="confirmation-summary-label">Info chicos</span>
                <span class="confirmation-summary-value">${summaryKidsInfo.replace(/\n/g, "<br>")}</span>
            </div>
        `);
    }

    if (summaryComment) {
        summaryRows.push(`
            <div class="confirmation-summary-row is-multiline">
                <span class="confirmation-summary-label">Datos adicionales</span>
                <span class="confirmation-summary-value">${summaryComment.replace(/\n/g, "<br>")}</span>
            </div>
        `);
    }

    els.confirmationSummary.innerHTML = `
        <div class="confirmation-summary-card">
            <div class="confirmation-summary-header">
                <span class="confirmation-summary-badge">Tu confirmación</span>
                ${dateText ? `<small class="confirmation-summary-date">Actualizado: ${dateText}</small>` : ""}
            </div>
            <div class="confirmation-summary-grid">
                ${summaryRows.join("")}
            </div>
        </div>
    `;

    els.confirmationSummary.classList.remove("hidden");
}

function syncChoiceCardSelection(els) {
    const selectedStatus = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const cards = els.confirmationForm?.querySelectorAll(".choice-card") || [];

    cards.forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.statusCard === selectedStatus);
    });
}

function updateConfirmationProgress(els) {
    syncProgressStepVisibility(els);

    const selectedStatus = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const companions = Number.parseInt(els.confirmationForm?.dataset.companions || "1", 10);
    const countFieldVisible = selectedStatus === "yes" && companions > 1;
    const hasGuestNames = getGuestNameInputs(els).some((input) => input.value.trim());
    const hasDetails = Boolean(
        hasGuestNames ||
        els.confirmationDietaryRestrictions?.value?.trim() ||
        els.confirmationComment?.value?.trim() ||
        els.confirmationKidsInfo?.value?.trim()
    );

    const stepMap = [
        [els.progressStepStatus, true, true],
        [els.progressStepCount, countFieldVisible ? Boolean(els.confirmationCount?.value) : selectedStatus === "no", countFieldVisible],
        [els.progressStepDetails, hasDetails, true]
    ];

    stepMap.forEach(([el, completed, active]) => {
        if (!el || el.classList.contains("hidden")) return;

        el.classList.toggle("is-complete", Boolean(completed));
        el.classList.toggle("is-active", !completed && Boolean(active));
    });
}

function getStickyTexts(existingConfirmation) {
    if (existingConfirmation?.status === "yes") {
        return {
            title: "Actualizar confirmación",
            hint: "Ya registramos tu asistencia"
        };
    }

    if (existingConfirmation?.status === "no") {
        return {
            title: "Actualizar confirmación",
            hint: "Podés actualizarla si cambió algo"
        };
    }

    return {
        title: "Confirmación",
        hint: "Completala en unos segundos"
    };
}

function renderMobileStickyRsvp(els, data, options = {}) {
    if (!els.mobileStickyRsvp || !els.mobileStickyRsvpButton) return;

    const closed = isConfirmationClosed(data);
    const existingConfirmation = data?.existingConfirmation || null;
    const shouldShowSticky = !existingConfirmation;
    const texts = getStickyTexts(existingConfirmation);

    if (els.mobileStickyRsvpTitle) {
        els.mobileStickyRsvpTitle.textContent = texts.title;
    }

    if (els.mobileStickyRsvpHint) {
        els.mobileStickyRsvpHint.textContent = closed
            ? "La confirmación ya se encuentra cerrada"
            : texts.hint;
    }

    els.mobileStickyRsvpButton.textContent = closed ? "Ver estado" : texts.title;
    els.mobileStickyRsvp.classList.toggle("hidden", !shouldShowSticky);
    els.mobileStickyRsvp.classList.toggle("is-closed", closed);
    els.mobileStickyRsvp.classList.toggle("is-contextually-hidden", true);

    if (els.mobileStickyRsvp.dataset.bound === "true") {
        els.mobileStickyRsvp.dataset.enabled = shouldShowSticky ? "true" : "false";
        window.dispatchEvent(new CustomEvent("invitation:mobilefloatingui"));
        return;
    }

    els.mobileStickyRsvp.dataset.enabled = shouldShowSticky ? "true" : "false";

    const navigateToRsvp = () => {
        if (options.state) {
            goToSection(els, options.state, "rsvp");
            return;
        }

        els.panelRsvp?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const syncStickyVisibility = () => {
        const enabled = els.mobileStickyRsvp.dataset.enabled === "true";

        if (!enabled) {
            els.mobileStickyRsvp.classList.add("hidden");
            window.dispatchEvent(new CustomEvent("invitation:mobilefloatingui"));
            return;
        }

        const isMobile = window.matchMedia?.("(max-width: 720px)")?.matches ?? window.innerWidth <= 720;
        const isRsvpActive = document.body.dataset.activeSection === "rsvp";
        const hero = document.querySelector(".hero-card");
        const heroRect = hero?.getBoundingClientRect?.();
        const footer = document.querySelector(".footer");
        const footerRect = footer?.getBoundingClientRect?.();
        const navRect = els.sectionNav?.getBoundingClientRect?.();
        const heroMostlyVisible = Boolean(heroRect && heroRect.bottom > window.innerHeight * 0.42);
        const navNearTop = Boolean(navRect && navRect.top < 110);
        const deepEnoughIntoPage = window.scrollY > Math.max(window.innerHeight * 0.55, 260);
        const nearFooter = Boolean(footerRect && footerRect.top < window.innerHeight - 140);
        const shouldHide = !isMobile || isRsvpActive || !deepEnoughIntoPage || heroMostlyVisible || !navNearTop || nearFooter;

        els.mobileStickyRsvp.classList.remove("hidden");
        els.mobileStickyRsvp.classList.toggle("is-contextually-hidden", shouldHide);
        window.dispatchEvent(new CustomEvent("invitation:mobilefloatingui"));
    };

    els.mobileStickyRsvpButton.addEventListener("click", navigateToRsvp);
    window.addEventListener("invitation:sectionchange", syncStickyVisibility);
    window.addEventListener("scroll", syncStickyVisibility, { passive: true });
    window.addEventListener("resize", syncStickyVisibility);
    window.addEventListener("orientationchange", syncStickyVisibility);

    requestAnimationFrame(syncStickyVisibility);

    els.mobileStickyRsvp.dataset.bound = "true";
}

function refreshUiState(els, data, options = {}) {
    syncCountFieldVisibility(els);
    syncGuestNamesFieldVisibility(els);
    syncKidsInfoFieldVisibility(els, data);
    syncChoiceCardSelection(els);
    updateConfirmationProgress(els);
    renderMobileStickyRsvp(els, data, options);
}

function setupConfirmationForm(els, data, options = {}) {
    if (!els.confirmationForm || els.confirmationForm.dataset.bound === "true") return;

    const statusInputs = Array.from(els.confirmationForm.querySelectorAll('input[name="confirmationStatus"]'));
    statusInputs.forEach((input) => {
        input.addEventListener("change", () => {
            refreshUiState(els, data, options);
            setFeedback(els, "", "info");
        });
    });

    [els.confirmationCount, els.confirmationDietaryRestrictions, els.confirmationComment, els.confirmationKidsInfo]
        .filter(Boolean)
        .forEach((field) => {
            field.addEventListener("input", () => {
                refreshUiState(els, data, options);
            });
        });

    els.confirmationGuestNamesList?.addEventListener("input", () => {
        try {
            els.confirmationForm.dataset.attendeeNames = JSON.stringify(
                getGuestNameInputs(els).map((field) => field.value.trim())
            );
        } catch {
            // noop
        }
        updateConfirmationProgress(els);
    });

    els.confirmationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = els.confirmationForm?.dataset.token || "";
        if (!token) {
            setFeedback(els, "No encontramos el acceso de esta invitación. Recargá la página e intentá de nuevo.", "error");
            return;
        }

        const payload = buildPayload(els);
        if (payload.status === "yes" && (!Number.isFinite(payload.attendingCount) || payload.attendingCount < 1)) {
            setFeedback(els, "Elegí cuántas personas asistirán antes de enviar la confirmación.", "error");
            return;
        }

        if (payload.status === "yes" && payload.attendingCount > 1 && payload.attendeeNames.length < payload.attendingCount) {
            setFeedback(els, "Completá nombre y apellido de todas las personas que van a asistir.", "error");
            return;
        }

        setFormDisabled(els, true);
        setSubmitLoading(els, true, Boolean(data?.existingConfirmation));
        setFeedback(els, "Estamos guardando tu confirmación. Esto tarda solo un instante.", "info");

        try {
            const result = await submitConfirmation(payload);

            if (!result?.ok) {
                throw new Error(result?.error || "UNKNOWN_ERROR");
            }

            const updatedConfirmation = {
                status: payload.status,
                attendingCount: payload.attendingCount,
                dietaryRestrictions: payload.dietaryRestrictions,
                comment: payload.comment,
                updatedAt: result.updatedAt || new Date().toISOString()
            };

            mergeInvitationConfirmationCache(payload.token, updatedConfirmation);
            data.existingConfirmation = updatedConfirmation;

            setFeedback(
                els,
                result.updated
                    ? COPY.rsvp.successUpdate(getGrammarFromForm(els))
                    : COPY.rsvp.successNew,
                "success"
            );

            setSubmitButtonLabel(els, true);
            setHelperText(els, { existingConfirmation: updatedConfirmation });
            renderConfirmationSummary(els, updatedConfirmation);
            updateHeroPrimaryAction(els, { existingConfirmation: updatedConfirmation }, options.state || null);
            updateHeroRsvpState(els, updatedConfirmation, data?.confirmationDeadlineText || "");
            renderMobileStickyRsvp(els, { ...data, existingConfirmation: updatedConfirmation }, options);
            refreshUiState(els, { ...data, existingConfirmation: updatedConfirmation }, options);
        } catch (error) {
            setSubmitLoading(els, false, Boolean(data?.existingConfirmation));
            setFeedback(els, getFriendlyErrorMessage(error?.message), "error");
        } finally {
            setFormDisabled(els, false);
            setSubmitButtonLabel(els, Boolean(data?.existingConfirmation));
            syncCountFieldVisibility(els);
            syncGuestNamesFieldVisibility(els);
            syncKidsInfoFieldVisibility(els, data);
        }
    });

    els.confirmationForm.dataset.bound = "true";
}

export function renderConfirmation(els, data, options = {}) {
    if (!els.confirmationForm) return;

    const closed = isConfirmationClosed(data);

    els.confirmationForm.dataset.token = options.token || "";
    els.confirmationForm.dataset.companions = String(
        Number.isFinite(Number(data?.companions)) ? Math.max(1, Number(data.companions)) : 1
    );
    els.confirmationForm.dataset.kidsAllowed = data?.grammar?.kidsAllowed ? "true" : "false";
    els.confirmationForm.dataset.isPlural = data?.grammar?.isPlural ? "true" : "false";
    if (!els.confirmationForm.dataset.attendeeNames) {
        els.confirmationForm.dataset.attendeeNames = "[]";
    }

    renderConfirmationCopy(els, data);
    hydrateConfirmationForm(els, data);
    setSubmitButtonLabel(els, Boolean(data?.existingConfirmation));
    setHelperText(els, data);
    renderConfirmationSummary(els, data?.existingConfirmation);
    renderMobileStickyRsvp(els, data, options);

    els.confirmationClosedNote?.classList.toggle("hidden", !closed);
    els.confirmationForm.classList.toggle("hidden", closed);

    if (closed) {
        if (els.confirmationClosedNote) {
            els.confirmationClosedNote.textContent = COPY.rsvp.closed;
        }

        setFeedback(els, "", "info");
        setFormDisabled(els, true);
        setSubmitLoading(els, false, Boolean(data?.existingConfirmation));
        refreshUiState(els, data, options);
        return;
    }

    refreshUiState(els, data, options);
    setFeedback(els, "", "info");
    setFormDisabled(els, false);
    setupConfirmationForm(els, data, options);
}