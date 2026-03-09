import { COPY } from "../constants/copy.js";

export function getInvitationViewData(data) {
    const companions = Number.isFinite(Number(data.companions))
        ? Number(data.companions)
        : 1;

    const companionsText =
        companions === 1
            ? COPY.companions.single
            : COPY.companions.multiple(companions);

    return {
        ...data,
        companions,
        companionsText
    };
}
