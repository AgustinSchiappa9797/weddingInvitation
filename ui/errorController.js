import { COPY } from "../constants/copy.js";
import { hideWelcomeScreen } from "./welcomeScreen.js";
import { showError } from "./errorView.js";

export function createErrorController(els) {
    async function showInvitationError(copy) {
        showError(els, copy);
        await hideWelcomeScreen(els);
    }

    async function handleInvitationError(error) {
        console.error(
            "Error cargando invitación:",
            error
        );

        if (error?.message === "REQUEST_TIMEOUT") {
            return showInvitationError(
                COPY.errors.timeout
            );
        }

        if (error?.message === "INVALID_INVITATION") {
            return showInvitationError(
                COPY.errors.invalidAccess
            );
        }

        return showInvitationError(
            COPY.errors.connection
        );
    }

    return {
        showInvitationError,
        handleInvitationError
    };
}