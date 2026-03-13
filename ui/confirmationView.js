import { submitConfirmation } from "../api/confirmationApi.js";
import { mergeInvitationConfirmationCache } from "../api/invitationApi.js";
import { updateHeroPrimaryAction } from "./heroView.js";

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

function setFormDisabled(els, disabled) {
    const controls = [
        els.confirmationCount,
        els.confirmationDietaryRestrictions,
        els.confirmationComment,
        els.confirmationSubmitButton,
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

    els.confirmationCountField?.classList.toggle("hidden", !isAttending);

    if (els.confirmationCount) {
        els.confirmationCount.disabled = !isAttending;
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

function buildPayload(els) {
    const status = els.confirmationForm?.querySelector('input[name="confirmationStatus"]:checked')?.value || "yes";
    const attendingCount = status === "yes"
        ? Number.parseInt(els.confirmationCount?.value || "0", 10)
        : 0;

    return {
        token: els.confirmationForm?.dataset.token || "",
        status,
        attendingCount,
        dietaryRestrictions: els.confirmationDietaryRestrictions?.value?.trim() || "",
        comment: els.confirmationComment?.value?.trim() || ""
    };
}

function setSubmitButtonLabel(els, hasExistingConfirmation) {
    if (!els.confirmationSubmitButton) return;

    els.confirmationSubmitButton.textContent = hasExistingConfirmation
        ? "Actualizar confirmación"
        : "Enviar confirmación";
}

function setHelperText(els, data) {
    if (!els.rsvpHelperText) return;

    if (data?.existingConfirmation) {
        els.rsvpHelperText.textContent = "Ya habíamos recibido tu respuesta. Si querés, podés actualizarla.";
        return;
    }

    els.rsvpHelperText.textContent = "Nos ayuda muchísimo para organizar cada detalle.";
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
        populateCountOptions(els.confirmationCount, companions, 1);
        return;
    }

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
        els.confirmationComment.value = existing.comment || "";
    }
}

function renderConfirmationSummary(els, existingConfirmation) {
    if (!els.confirmationSummary) return;

    if (!existingConfirmation) {
        els.confirmationSummary.textContent = "";
        els.confirmationSummary.classList.add("hidden");
        return;
    }

    const parts = [];

    if (existingConfirmation.status === "yes") {
        const count = existingConfirmation.attendingCount || 1;
        parts.push(`Asistencia confirmada: ${count} persona${count === 1 ? "" : "s"}.`);
    } else {
        parts.push("Marcó que no podrá asistir.");
    }

    if (existingConfirmation.dietaryRestrictions) {
        parts.push(`Restricciones: ${existingConfirmation.dietaryRestrictions}.`);
    }

    if (existingConfirmation.comment) {
        parts.push(`Comentario: ${existingConfirmation.comment}.`);
    }

    if (existingConfirmation.updatedAt) {
        const date = new Date(existingConfirmation.updatedAt);
        if (!Number.isNaN(date.getTime())) {
            parts.push(`Última actualización: ${date.toLocaleString("es-AR")}.`);
        }
    }

    els.confirmationSummary.textContent = parts.join(" ");
    els.confirmationSummary.classList.remove("hidden");
}

function setupConfirmationForm(els) {
    if (!els.confirmationForm || els.confirmationForm.dataset.bound === "true") return;

    const statusInputs = Array.from(els.confirmationForm.querySelectorAll('input[name="confirmationStatus"]'));
    statusInputs.forEach((input) => {
        input.addEventListener("change", () => {
            syncCountFieldVisibility(els);
            setFeedback(els, "", "info");
        });
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

        setFormDisabled(els, true);
        setFeedback(els, "Guardando confirmación…", "info");

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

            setFeedback(
                els,
                result.updated
                    ? "Actualizamos su confirmación correctamente."
                    : "La confirmación quedó registrada. ¡Gracias!",
                "success"
            );

            setSubmitButtonLabel(els, true);
            setHelperText(els, { existingConfirmation: updatedConfirmation });
            renderConfirmationSummary(els, updatedConfirmation);
            updateHeroPrimaryAction(els, { existingConfirmation: updatedConfirmation });
        } catch (error) {
            setFeedback(els, getFriendlyErrorMessage(error?.message), "error");
        } finally {
            setFormDisabled(els, false);
            syncCountFieldVisibility(els);
        }
    });

    els.confirmationForm.dataset.bound = "true";
}

export function renderConfirmation(els, data, options = {}) {
    if (!els.confirmationForm) return;

    const companions = Number.isFinite(Number(data?.companions)) ? Math.max(1, Number(data.companions)) : 1;
    const closed = isConfirmationClosed(data);

    els.confirmationForm.dataset.token = options.token || "";

    hydrateConfirmationForm(els, data);
    setSubmitButtonLabel(els, Boolean(data?.existingConfirmation));
    setHelperText(els, data);
    renderConfirmationSummary(els, data?.existingConfirmation);

    els.confirmationClosedNote?.classList.toggle("hidden", !closed);
    els.confirmationForm.classList.toggle("hidden", closed);

    if (closed) {
        setFeedback(els, "", "info");
        setFormDisabled(els, true);
        return;
    }

    populateCountOptions(
        els.confirmationCount,
        companions,
        data?.existingConfirmation?.status === "yes"
            ? Math.min(companions, Math.max(1, Number(data.existingConfirmation.attendingCount) || 1))
            : Number.parseInt(els.confirmationCount?.value || "1", 10)
    );

    syncCountFieldVisibility(els);
    setFeedback(els, "", "info");
    setFormDisabled(els, false);

    setupConfirmationForm(els);
}