export const COPY = {

    cinematic: {
        loadingLead: "En unos segundos vas a poder verla.",
        loadingClosingLine: "Gracias por acompañarnos en este momento 💛",
        readyLead: "Ya está todo listo para darte la bienvenida.",
        readyClosingLine: "Disfrutá cada detalle con calma y a tu ritmo.",
        progress: {
            validating: "Validando acceso…",
            preparing: "Preparando apertura…",
            cover: "Cargando portada…",
            done: "Todo listo."
        }
    },
    loading: {
        kicker: "Estamos preparando tu invitación",
        title: "Tu invitación",
        message: ""
    },
    ready: {
        kicker: "Qué alegría tenerte acá",
        guestFallback: "Invitado/a",
        message: "Tu invitación ya está lista. Ojalá disfrutes cada sección tanto como nosotros disfrutamos prepararla."
    },
    defaults: {
        heroTitle: "Nuestra Boda",
        heroEyebrow: "Guardá esta fecha",
        heroSubtitle: ({ isPlural }) =>
            isPlural
                ? "Queremos compartir esta celebración con ustedes y que la vivan desde el primer momento."
                : "Queremos compartir esta celebración con vos y que la vivas desde el primer momento.",
        heroIntro: () => "",
        guestName: "Invitado especial",
        footerText: "Gracias por acompañarnos en este momento tan importante. Nos emociona compartirlo con vos.",
        rsvpDeadline: "-"
    },

    companions: {
        single: "Tu lugar ya te está esperando",
        multiple: (count) => `Reservamos ${count} lugares para ustedes`
    },

    tags: {
        kidsAllowed: ({ isPlural }) =>
            isPlural
                ? "Pueden venir con chicos"
                : "Podés venir con chicos",
        adultsOnly: "En esta ocasión, la invitación es sin niños"
    },

    rsvp: {
        sectionTitle: "Confirmación",
        intro: ({ isPlural }) =>
            isPlural
                ? "Nos ayudaría mucho que nos confirmen si podrán acompañarnos, así organizamos cada detalle con tiempo."
                : "Nos ayudaría mucho que nos confirmes si vas a poder acompañarnos, así organizamos cada detalle con tiempo.",

        helperDefault: "Tu confirmación nos ayuda a preparar la celebración de la mejor manera.",
        helperUrgent: "Estamos cerrando la organización. Si pueden, les pedimos que confirmen hoy mismo.",
        helperExisting: "Ya habíamos recibido tu confirmación. Si cambió algo, podés actualizarla acá mismo.",

        legend: ({ isPlural, kidsAllowed }) => {
            if (kidsAllowed) {
                return isPlural
                    ? "¿Van a acompañarnos? Si vienen con chicos, cuéntennos así dejamos todo listo."
                    : "¿Vas a acompañarnos? Si venís con chicos, contanos así dejamos todo listo.";
            }

            return isPlural
                ? "¿Podrán acompañarnos en este día tan especial?"
                : "¿Vas a poder acompañarnos en este día tan especial?";
        },

        commentLabel: () => "Mensaje adicional",

        commentPlaceholder: ({ isPlural }) =>
            isPlural
                ? "Si quieren, pueden dejarnos una nota o comentario adicional."
                : "Si querés, podés dejarnos una nota o comentario adicional.",

        kidsInfoLabel: ({ isPlural }) =>
            isPlural
                ? "Si vienen con chicos, cuéntennos edades o cualquier dato útil"
                : "Si venís con chicos, contanos edades o cualquier dato útil",

        kidsInfoPlaceholder: ({ isPlural }) =>
            isPlural
                ? "Ej.: Sofi (4) y Tomi (7), uno necesita menú especial"
                : "Ej.: Emma (3), necesita menú especial o silla alta",

        yesOptionTitle: ({ isPlural }) =>
            isPlural ? "Sí, ahí estaremos" : "Sí, ahí estaré",

        yesOptionHint: ({ isPlural }) =>
            isPlural
                ? "Así reservamos sus lugares con todo listo."
                : "Así reservamos tu lugar con todo listo.",

        noOptionTitle: ({ isPlural }) =>
            isPlural ? "No vamos a poder asistir" : "No voy a poder asistir",

        noOptionHint: ({ isPlural }) =>
            isPlural
                ? "Igualmente nos encantará recibir un mensajito de ustedes."
                : "Igualmente nos encantará recibir un mensajito tuyo.",

        countLabel: ({ kidsAllowed }) =>
            kidsAllowed
                ? "¿Cuántas personas asistirán en total?"
                : "¿Cuántas personas asistirán?",

        guestNamesLabel: () => "¿Quiénes asistirán?",
        guestNamesHelper: () => "Escribí nombre y apellido de cada persona que va a asistir.",

        dietaryLabel: ({ kidsAllowed }) =>
            kidsAllowed
                ? "Restricciones alimentarias o aclaraciones"
                : "Restricciones alimentarias",

        dietaryPlaceholder: ({ kidsAllowed }) =>
            kidsAllowed
                ? "Ej.: 1 vegetariano, 1 celíaco, un menor con menú especial"
                : "Ej.: 1 vegetariano, 1 celíaco",

        submitNew: "Confirmar asistencia",
        submitUpdate: "Actualizar confirmación",

        successNew: "Tu confirmación quedó registrada. ¡Gracias por acompañarnos también desde acá!",
        successUpdate: ({ isPlural }) =>
            isPlural
                ? "Actualizamos su confirmación correctamente."
                : "Actualizamos tu confirmación correctamente.",

        closed: "La confirmación ya cerró. Si necesitás avisarnos un cambio, escribinos directamente para poder tenerlo en cuenta."
    },

    details: {
        kicker: "El gran día",
        title: "Todo lo importante, en un solo lugar",
        intro: ({ isPlural }) =>
            isPlural
                ? "Acá van a encontrar los horarios principales y la información necesaria para disfrutar la celebración con tranquilidad."
                : "Acá vas a encontrar los horarios principales y la información necesaria para disfrutar la celebración con tranquilidad.",
        calendarButton: "Agendar evento",
        scheduleKicker: "Agenda sugerida",
        scheduleTitle: "Cómo se va a vivir el día",
        locationCardTitle: "Lugar de la celebración",
        locationFallback: "Muy pronto vas a ver acá el lugar confirmado"
    },

    access: {
        kicker: "Cómo llegar",
        title: "Dirección y recomendaciones",
        intro: ({ isPlural }) =>
            isPlural
                ? "Les dejamos toda la información práctica para que llegar sea simple y puedan enfocarse solo en disfrutar."
                : "Te dejamos toda la información práctica para que llegar sea simple y puedas enfocarte solo en disfrutar.",
        venueKicker: "Venue",
        mapButton: "Abrir en Google Maps",
        copyAddressButton: "Copiar dirección",
        routeHint: "Guarden esta dirección para tenerla a mano el día del evento.",
        quickFactsTitle: "Datos rápidos",
        notesTitle: "Información útil",
        copied: "Dirección copiada",
        copyError: "No pudimos copiarla automáticamente"
    },


    gallery: {
        intro: ({ isPlural }) =>
            isPlural
                ? "Una pequeña selección de recuerdos para que recorran esta historia con nosotros."
                : "Una pequeña selección de recuerdos para que recorras esta historia con nosotros.",
        hint: "Deslizá para recorrer las fotos y tocá una para verla en grande.",
        counterLabel: "Selección"
    },

    playlist: {
        kicker: "Nuestra música",
        title: "Playlist",
        description: ({ isPlural }) =>
            isPlural
                ? "Estas canciones nos acompañaron en momentos importantes y queremos compartirlas con ustedes antes de la celebración."
                : "Estas canciones nos acompañaron en momentos importantes y queremos compartirlas con vos antes de la celebración.",
        cardTitle: "Escuchá la playlist del casamiento",
        buttonLabel: "Abrir en Spotify",
        highlightLabel: "Nuestra elegida",
        highlightSong: "Una canción especial para este momento"
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