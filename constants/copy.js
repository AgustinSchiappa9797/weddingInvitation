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
        heroSubtitle: "Queremos compartir este día con vos.",
        guestName: "Invitado especial",
        footerText: "Con amor",
        rsvpDeadline: "-"
    },
    companions: {
        single: "Invitación válida para 1 persona",
        multiple: (count) => `Invitación válida para ${count} personas`
    },
    tags: {
        kidsAllowed: "Puede asistir con niños",
        adultsOnly: "Solo adultos"
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
