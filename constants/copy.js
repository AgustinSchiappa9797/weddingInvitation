export const COPY = {
    loading: {
        kicker: "Estamos preparando tu invitación",
        title: "Un momento...",
        message: "Estamos cargando cada detalle para vos."
    },
    ready: {
        kicker: "Nos alegra recibirte",
        guestFallback: "Invitado/a",
        message: "Tu invitación ya está lista para que disfrutes cada detalle."
    },
    defaults: {
        heroTitle: "Nuestra Boda",
        heroSubtitle: ({ isPlural }) =>
            isPlural
                ? "Queremos compartir este día con ustedes."
                : "Queremos compartir este día con vos.",
        guestName: "Invitado especial",
        footerText: "Con amor",
        rsvpDeadline: "-"
    },

    companions: {
        single: "Esta invitación es solo para vos",
        multiple: (count) => `Esta invitación es para ${count} personas`
    },

    tags: {
        kidsAllowed: ({ isPlural }) =>
            isPlural
                ? "Si quieren, pueden venir con chicos"
                : "Si querés, podés venir con chicos",
        adultsOnly: "Solo adultos"
    },

    rsvp: {
        sectionTitle: "Confirmación",
        intro: ({ isPlural }) =>
            isPlural
                ? "Ayudanos confirmando su asistencia antes del"
                : "Ayudanos confirmando tu asistencia antes del",

        helperDefault: "Nos ayuda muchísimo para organizar cada detalle.",
        helperUrgent: "La fecha de confirmación está muy cerca.",
        helperExisting: "Ya habíamos recibido tu respuesta. Si querés, podés actualizarla.",

        legend: ({ isPlural, kidsAllowed }) => {
            if (kidsAllowed) {
                return isPlural
                    ? "¿Van a poder acompañarnos? Si vienen con chicos, cuéntennos así lo organizamos mejor."
                    : "¿Vas a poder acompañarnos? Si venís con chicos, contanos así lo organizamos mejor.";
            }

            return isPlural
                ? "¿Podrán acompañarnos?"
                : "¿Vas a poder acompañarnos?";
        },

        commentLabel: () => "Comentario adicional",

        commentPlaceholder: ({ isPlural }) =>
            isPlural
                ? "Si quieren, pueden dejarnos una nota adicional."
                : "Si querés, podés dejarnos una nota adicional.",

        kidsInfoLabel: ({ isPlural }) =>
            isPlural
                ? "Si vienen con chicos, cuéntennos sus edades o cualquier dato útil"
                : "Si venís con chicos, contanos sus edades o cualquier dato útil",

        kidsInfoPlaceholder: ({ isPlural }) =>
            isPlural
                ? "Ej.: Sofi (4) y Tomi (7), uno necesita menú especial, llevamos cochecito"
                : "Ej.: Emma (3), necesita menú especial o silla alta",

        yesOptionTitle: ({ isPlural }) =>
            isPlural ? "Sí, asistiremos" : "Sí, asistiré",

        yesOptionHint: ({ isPlural }) =>
            isPlural
                ? "Así podremos reservar su lugar."
                : "Así podremos reservar tu lugar.",

        noOptionTitle: ({ isPlural }) =>
            isPlural ? "No podremos asistir" : "No podré asistir",

        noOptionHint: ({ isPlural }) =>
            isPlural
                ? "Igualmente nos encantará saber de ustedes."
                : "Igualmente nos encantará saber de vos.",

        countLabel: ({ kidsAllowed }) =>
            kidsAllowed
                ? "¿Cuántas personas asistirán en total?"
                : "¿Cuántas personas asistirán?",

        dietaryLabel: ({ kidsAllowed }) =>
            kidsAllowed
                ? "Restricciones alimentarias o aclaraciones"
                : "Restricciones alimentarias",

        dietaryPlaceholder: ({ kidsAllowed }) =>
            kidsAllowed
                ? "Ej.: 1 vegetariano, 1 celíaco, viene un niño"
                : "Ej.: 1 vegetariano, 1 celíaco",

        submitNew: "Enviar confirmación",
        submitUpdate: "Actualizar confirmación",

        successNew: "La confirmación quedó registrada. ¡Gracias!",
        successUpdate: ({ isPlural }) =>
            isPlural
                ? "Actualizamos su confirmación correctamente."
                : "Actualizamos tu confirmación correctamente.",

        closed: "La confirmación ya se encuentra cerrada. Si necesitás avisarnos un cambio, escribinos directamente."
    },

    playlist: {
        kicker: "La música también la armamos entre todos",
        title: "Playlist",
        description: ({ isPlural }) =>
            isPlural
                ? "Sumen esas canciones que no pueden faltar para ustedes 🎶"
                : "Sumá esa canción que no puede faltar para vos 🎶",
        buttonLabel: ({ isPlural }) =>
            isPlural ? "Agregar canciones" : "Agregar canción"
    },

    errors: {
        missingToken: {
            heroSubtitle: "Falta el código de acceso en este enlace.",
            welcomeTitle: "Falta el acceso de la invitación",
            welcomeMessageText: "Este enlace no incluye un token válido para abrir la invitación.",
            errorTitle: "Falta el código de acceso",
            errorMessage: "Revisá que el enlace esté completo o pedile uno nuevo a los novios."
        },
        invalidAccess: {
            heroSubtitle: "No pudimos validar este acceso.",
            welcomeTitle: "No pudimos abrir tu invitación",
            welcomeMessageText: "Este enlace no es válido o ya no está disponible.",
            errorTitle: "Acceso inválido o vencido",
            errorMessage: "Este enlace no es válido o ya no está disponible."
        },
        timeout: {
            heroSubtitle: "La carga tardó demasiado.",
            welcomeTitle: "No pudimos cargar tu invitación",
            welcomeMessageText: "La carga demoró más de lo esperado. Recargá la página para reintentar.",
            errorTitle: "Tiempo de espera agotado",
            errorMessage: "La invitación tardó demasiado en responder. Recargá la página para volver a intentarlo."
        },
        connection: {
            heroSubtitle: "Tuvimos un problema al cargar la invitación.",
            welcomeTitle: "No pudimos cargar tu invitación",
            welcomeMessageText: "Parece que hubo un problema de conexión. Recargá la página para reintentar.",
            errorTitle: "Problema de conexión",
            errorMessage: "No pudimos cargar la invitación en este momento. Recargá la página para volver a intentarlo."
        },
        fallback: {
            heroTitle: "Invitación no disponible",
            heroSubtitle: "No pudimos validar este acceso.",
            guestName: "Acceso inválido",
            welcomeKickerText: "Ups",
            welcomeTitle: "No pudimos abrir tu invitación",
            welcomeMessageText: "Este enlace no es válido o ya no está disponible.",
            errorTitle: "No pudimos validar tu acceso",
            errorMessage: "Este enlace no es válido o ya no está disponible."
        }
    }
};