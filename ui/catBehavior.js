function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function getRect(selector) {
    const el = document.querySelector(selector);
    return el ? el.getBoundingClientRect() : null;
}

function weightedPick(items) {
    const valid = items.filter((item) => item && item.weight > 0 && typeof item.value === "function");
    if (!valid.length) return null;

    const total = valid.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * total;

    for (const item of valid) {
        cursor -= item.weight;
        if (cursor <= 0) {
            return item.value;
        }
    }

    return valid[valid.length - 1].value;
}

function getMostVisiblePanelSection() {
    const panels = [...document.querySelectorAll(".panel-section")];

    let best = null;
    let bestVisible = 0;

    for (const panel of panels) {
        const rect = panel.getBoundingClientRect();
        const visible = Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
        );

        if (visible > bestVisible) {
            bestVisible = visible;
            best = panel.dataset.panel;
        }
    }

    return best;
}

function buildZones() {
    const hero = getRect(".hero-card");
    const nav = getRect("#sectionNav");
    const panel = getRect("#contentPanel");
    const footer = getRect(".footer");
    const gallery = getRect("#panelGallery");

    const zones = {};

    if (hero) {
        zones.heroFloor = {
            id: "heroFloor",
            type: "floor",
            fromX: hero.left + 24,
            toX: hero.right - 120,
            y: hero.bottom - 56
        };
    }

    if (nav) {
        zones.navFloor = {
            id: "navFloor",
            type: "floor",
            fromX: nav.left + 12,
            toX: nav.right - 120,
            y: nav.bottom + 6
        };
    }

    if (panel) {
        zones.panelRight = {
            id: "panelRight",
            type: "wall",
            x: panel.right - 54,
            fromY: panel.bottom - 90,
            toY: panel.top + 28
        };

        zones.panelTop = {
            id: "panelTop",
            type: "perch",
            fromX: panel.left + 36,
            toX: panel.right - 140,
            y: panel.top - 8
        };

        zones.panelBottom = {
            id: "panelBottom",
            type: "floor",
            fromX: panel.left + 18,
            toX: panel.right - 120,
            y: panel.bottom - 56
        };
    }

    if (footer) {
        zones.footerWalk = {
            id: "footerWalk",
            type: "floor",
            fromX: footer.left + 20,
            toX: footer.right - 120,
            y: footer.top - 56
        };
    }

    if (gallery) {
        zones.galleryEdge = {
            id: "galleryEdge",
            type: "floor",
            fromX: gallery.left + 18,
            toX: gallery.right - 120,
            y: gallery.bottom - 48
        };
    }

    return zones;
}

function createTaskRunner(api, state) {
    async function ensureSpawn(zones) {
        if (api.hasSpawned()) {
            return;
        }

        const spawnZone =
            zones.heroFloor ||
            zones.navFloor ||
            zones.panelBottom ||
            zones.footerWalk;

        if (!spawnZone) return;

        await api.spawnAt({
            x: spawnZone.fromX,
            y: spawnZone.y,
            faceRight: true,
            mode: "walk"
        });
    }

    async function transitionLook(ms = 220) {
        await api.lookAround(ms);
    }

    async function doStretch() {
        state.lastTaskType = "stretch";
        await api.stretch(900);
        await api.lookAround(500);
    }

    async function doLoafPause() {
        state.lastTaskType = "loaf";
        await api.loaf(randomBetween(900, 1800));
        await api.lookAround(500);
    }

    async function scratchAndClimb(zone) {
        if (!zone) return;
        await scratchWall(zone);
        await climbWall(zone);
    }

    async function moveToFloorPoint(zone, x, pace = "walk") {
        if (!zone) return;

        await ensureSpawn({ [zone.id]: zone, heroFloor: zone });

        await api.moveFromCurrentTo({
            mode: pace,
            x,
            y: zone.y,
            duration: pace === "trot" ? 1600 : 2200,
            easing: pace === "trot" ? "ease-in-out" : "linear"
        });
    }

    async function walkFloor(zone, pace = "walk") {
        if (!zone) return;

        await ensureSpawn({ [zone.id]: zone, heroFloor: zone });

        const current = api.getPosition();
        const startX = current.x;
        const distToLeft = Math.abs(startX - zone.fromX);
        const distToRight = Math.abs(startX - zone.toX);

        const targetX =
            distToLeft < distToRight
                ? zone.toX
                : zone.fromX;

        if (state.lastTaskType === "sleepy-perch" || state.lastTaskType === "loaf" || Math.random() < 0.18) {
            await api.stretch(700);
        } else {
            await transitionLook(180);
        }

        await moveToFloorPoint(zone, targetX, pace);
        await transitionLook(240);
    }

    async function scratchWall(zone) {
        if (!zone) return;

        await ensureSpawn({ panelRight: zone, heroFloor: { fromX: zone.x - 80, toX: zone.x, y: zone.fromY } });

        await transitionLook(140);

        await api.moveFromCurrentTo({
            mode: "trot",
            x: zone.x,
            y: zone.fromY,
            duration: 1500,
            easing: "ease-in-out"
        });

        await api.lookAround(160);

        await api.moveTo({
            mode: "scratch",
            x: zone.x,
            y: zone.fromY,
            faceRight: true,
            duration: 180,
            easing: "ease-out"
        });

        await api.pause(1200);
    }

    async function climbWall(zone) {
        if (!zone) return;

        await api.lookAround(160);

        await api.moveTo({
            mode: "climb",
            x: zone.x,
            y: zone.toY,
            faceRight: true,
            duration: 2100,
            easing: "ease-out"
        });

        await api.lookAround(240);
    }

    async function perch(zone, { loafChance = 0.35 } = {}) {
        if (!zone) return;

        await ensureSpawn({ panelTop: zone, heroFloor: { fromX: zone.fromX, toX: zone.toX, y: zone.y } });

        const current = api.getPosition();
        const x = current.x < zone.fromX
            ? zone.fromX + 30
            : current.x > zone.toX
                ? zone.toX - 30
                : current.x;

        await api.moveFromCurrentTo({
            mode: "sit",
            x,
            y: zone.y,
            duration: 500,
            easing: "ease-out"
        });

        if (Math.random() < loafChance) {
            await api.loaf(randomBetween(1200, 2200));
            state.lastTaskType = "loaf";
            return;
        }

        await api.lookAround(600);
        await api.pause(randomBetween(900, 1500));
    }

    async function patrolFooter(zone) {
        if (!zone) return;
        await walkFloor(zone, Math.random() > 0.5 ? "walk" : "trot");
    }

    async function reactToSection(sectionKey, zones) {
        state.currentSection = sectionKey;

        if (sectionKey === "details") {
            if (zones.heroFloor) {
                state.lastZoneId = "heroFloor";
                state.lastTaskType = "section-details";
                await walkFloor(zones.heroFloor, "walk");
                await api.lookAround(700);

                if (Math.random() < 0.35) {
                    await doStretch();
                }
            }
            return;
        }

        if (sectionKey === "access") {
            if (zones.panelRight) {
                state.lastZoneId = "panelRight";
                state.lastTaskType = "section-access";
                await scratchWall(zones.panelRight);
                await climbWall(zones.panelRight);
            }

            if (zones.panelTop) {
                state.lastZoneId = "panelTop";
                await perch(zones.panelTop, { loafChance: 0.2 });
            }
            return;
        }

        if (sectionKey === "gallery") {
            if (zones.galleryEdge) {
                state.lastZoneId = "galleryEdge";
                state.lastTaskType = "section-gallery";
                await walkFloor(zones.galleryEdge, "walk");
                await api.lookAround(1200);
                return;
            }

            if (zones.panelBottom) {
                state.lastZoneId = "panelBottom";
                state.lastTaskType = "section-gallery-fallback";
                await walkFloor(zones.panelBottom, "walk");
            }
            return;
        }

        if (sectionKey === "rsvp") {
            if (zones.panelBottom) {
                state.lastZoneId = "panelBottom";
                state.lastTaskType = "section-rsvp";
                await walkFloor(zones.panelBottom, "walk");
                await api.lookAround(1100);
            }
            return;
        }

        if (sectionKey === "playlist") {
            if (zones.navFloor) {
                state.lastZoneId = "navFloor";
                state.lastTaskType = "section-playlist";
                await walkFloor(zones.navFloor, "trot");
                await api.lookAround(500);
            }

            if (zones.panelRight && Math.random() < 0.6) {
                await scratchWall(zones.panelRight);
            }

            return;
        }

        if (sectionKey === "gift") {
            if (zones.panelRight) {
                state.lastZoneId = "panelRight";
                state.lastTaskType = "section-gift";
                await scratchWall(zones.panelRight);
                await climbWall(zones.panelRight);
            }

            if (zones.panelTop) {
                state.lastZoneId = "panelTop";
                await perch(zones.panelTop, { loafChance: 0.75 });
                await api.lookAround(1400);
            }
            return;
        }

        if (zones.heroFloor) {
            state.lastZoneId = "heroFloor";
            state.lastTaskType = "section-fallback";
            await walkFloor(zones.heroFloor, "walk");
        }
    }

    async function idleRoutine(zones) {
        const mood = state.mood;

        const candidates = [
            {
                weight: zones.heroFloor ? (state.lastZoneId === "heroFloor" ? 1 : 3) : 0,
                value: async () => {
                    state.lastZoneId = "heroFloor";
                    state.lastTaskType = "walk";
                    await walkFloor(zones.heroFloor, mood === "playful" ? "trot" : "walk");
                    await api.pause(220);
                }
            },
            {
                weight: zones.navFloor ? (state.lastZoneId === "navFloor" ? 1 : 2) : 0,
                value: async () => {
                    state.lastZoneId = "navFloor";
                    state.lastTaskType = "walk";
                    await walkFloor(zones.navFloor, mood === "playful" ? "trot" : "walk");
                    await api.pause(180);
                }
            },
            {
                weight: zones.panelBottom ? (state.lastZoneId === "panelBottom" ? 1 : 2) : 0,
                value: async () => {
                    state.lastZoneId = "panelBottom";
                    state.lastTaskType = "walk";
                    await walkFloor(zones.panelBottom, "walk");
                    await api.pause(180);
                }
            },
            {
                weight: zones.panelTop ? (mood === "sleepy" ? 4 : 2) : 0,
                value: async () => {
                    state.lastZoneId = "panelTop";
                    state.lastTaskType = "perch";
                    await perch(zones.panelTop, { loafChance: mood === "sleepy" ? 0.85 : 0.45 });
                }
            },
            {
                weight: zones.panelRight && mood !== "sleepy" ? 2 : 0,
                value: async () => {
                    state.lastZoneId = "panelRight";
                    state.lastTaskType = "scratch";
                    await scratchWall(zones.panelRight);
                }
            },
            {
                weight: zones.panelRight && mood === "playful" ? 2 : 1,
                value: async () => {
                    if (!zones.panelRight) return;
                    state.lastZoneId = "panelRight";
                    state.lastTaskType = "scratch-climb";
                    await scratchAndClimb(zones.panelRight);
                }
            },
            {
                weight: mood === "sleepy" ? 2 : 1,
                value: async () => {
                    await doLoafPause();
                }
            },
            {
                weight: mood !== "sleepy" ? 2 : 0.5,
                value: async () => {
                    await doStretch();
                }
            },
            {
                weight: zones.footerWalk ? (mood === "playful" ? 2 : 1) : 0,
                value: async () => {
                    state.lastZoneId = "footerWalk";
                    state.lastTaskType = "footer";
                    await patrolFooter(zones.footerWalk);
                }
            }
        ];

        const task = weightedPick(candidates);
        if (task) {
            await task();
        }
    }

    async function sleepyRoutine(zones) {
        if (zones.panelTop) {
            state.lastZoneId = "panelTop";
            state.lastTaskType = "sleepy-perch";
            await perch(zones.panelTop, { loafChance: 0.95 });
            await api.lookAround(1000);
            await api.pause(1600);
            return;
        }

        if (zones.footerWalk) {
            state.lastZoneId = "footerWalk";
            state.lastTaskType = "sleepy-walk";
            await walkFloor(zones.footerWalk, "walk");
        }
    }

    return {
        reactToSection,
        idleRoutine,
        sleepyRoutine
    };
}

export function setupCatBehavior(api) {
    if (!api) {
        return;
    }

    const state = {
        busy: false,
        currentSection: "details",
        lastInteractionAt: Date.now(),
        mood: "curious",
        destroyed: false,
        lastZoneId: null,
        lastTaskType: null,
        lastSectionReactionAt: 0
    };

    const runner = createTaskRunner(api, state);

    function markInteraction() {
        state.lastInteractionAt = Date.now();
    }

    function getMood() {
        const idleFor = Date.now() - state.lastInteractionAt;

        if (idleFor > 30000) return "sleepy";
        if (idleFor < 6000) return "playful";
        return "curious";
    }

    async function runTask(taskFn) {
        if (state.busy || state.destroyed) return;

        state.busy = true;

        try {
            const zones = buildZones();
            state.mood = getMood();
            await taskFn(zones);
        } catch (error) {
            console.error("cat behavior error:", error);
        } finally {
            state.busy = false;
        }
    }

    function scheduleIdleLoop() {
        async function loop() {
            if (state.destroyed) return;

            await runTask(async (zones) => {
                if (state.mood === "sleepy") {
                    await runner.sleepyRoutine(zones);
                } else {
                    await runner.idleRoutine(zones);
                }
            });

            const delay = state.mood === "sleepy" ? 2400 : 900;
            window.setTimeout(loop, delay);
        }

        requestAnimationFrame(() => {
            window.setTimeout(loop, 120);
        });
    }

    function bindSectionTabs() {
        document.querySelectorAll(".section-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                const now = Date.now();
                if (now - state.lastSectionReactionAt < 1800) return;

                state.lastSectionReactionAt = now;

                const section = tab.dataset.section || "details";
                state.currentSection = section;
                markInteraction();

                runTask(async (zones) => {
                    await runner.reactToSection(section, zones);
                });
            });
        });
    }

    function bindPointerReaction() {
        let lastPointerReactionAt = 0;

        document.addEventListener("mousemove", (event) => {
            const now = Date.now();
            if (now - lastPointerReactionAt < 3500) return;
            if (state.busy) return;

            const mode = api.getMode?.();
            if (mode === "climb" || mode === "scratch") return;

            const catRect = api.getRect();
            if (!catRect) return;

            const dx = event.clientX - (catRect.left + catRect.width / 2);
            const dy = event.clientY - (catRect.top + catRect.height / 2);
            const distance = Math.hypot(dx, dy);

            if (distance > 120) return;

            lastPointerReactionAt = now;
            markInteraction();

            runTask(async () => {
                api.faceToward(event.clientX);
                await api.lookAround(500);

                if (distance < 70) {
                    await api.nudgeAway(dx < 0 ? "right" : "left");
                }
            });
        });
    }

    function bindCatClick() {
        const catEl = api.getElement();
        if (!catEl) return;

        catEl.style.pointerEvents = "auto";

        catEl.addEventListener("click", (event) => {
            event.stopPropagation();
            markInteraction();

            runTask(async () => {
                if (state.mood === "sleepy") {
                    await api.loaf(1500);
                } else if (state.mood === "playful") {
                    await api.reactToPet();
                } else {
                    if (Math.random() < 0.5) {
                        await api.stretch(800);
                    } else {
                        await api.lookAround(700);
                    }
                }

                await api.lookAround(900);
            });
        });
    }

    function bindScrollReaction() {
        let lastScrollReactionAt = 0;

        window.addEventListener("scroll", () => {
            const now = Date.now();
            if (now - lastScrollReactionAt < 3500) return;

            lastScrollReactionAt = now;
            markInteraction();

            const currentActiveTab = document.querySelector(".section-tab[aria-selected='true']");
            const section =
                getMostVisiblePanelSection() ||
                currentActiveTab?.dataset.section ||
                state.currentSection;

            runTask(async (zones) => {
                await runner.reactToSection(section, zones);
            });
        }, { passive: true });
    }

    bindSectionTabs();
    bindPointerReaction();
    bindCatClick();
    bindScrollReaction();
    scheduleIdleLoop();

    return {
        destroy() {
            state.destroyed = true;
        }
    };
}