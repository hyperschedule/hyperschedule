import * as Zustand from "zustand";
import * as ZustandMiddleware from "zustand/middleware";
import { produce } from "immer";

import * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

import { pick } from "@lib/store";

import { toast } from "react-toastify";
import { apiFetch } from "@lib/api";

export type Store = {
    hasConfirmedGuest: boolean;
    schedules: Record<string, APIv4.UserSchedule>;
    server: Omit<APIv4.ServerUser, "schedules"> | null;
    activeScheduleId: APIv4.ScheduleId | null;
    activeTerm: APIv4.TermIdentifier;

    // mutators
    confirmGuest: () => void;
    scheduleAddSection: (request: APIv4.AddSectionRequest) => void;
    scheduleDeleteSection: (request: APIv4.DeleteSectionRequest) => void;
    scheduleSetSections: (request: APIv4.ReplaceSectionsRequest) => void;
    scheduleSetSectionAttrs: (request: APIv4.SetSectionAttrRequest) => void;
    addSchedule: (
        request: APIv4.AddScheduleRequest,
    ) => Promise<APIv4.ScheduleId>;
    deleteSchedule: (request: APIv4.DeleteScheduleRequest) => void;
    renameSchedule: (request: APIv4.RenameScheduleRequest) => void;
    duplicateSchedule: (
        request: APIv4.DuplicateScheduleRequest,
    ) => Promise<APIv4.ScheduleId>;
    setActiveTerm: (term: APIv4.TermIdentifier) => void;
    setActiveScheduleId: (scheduleId: APIv4.ScheduleId) => void;
};

function firstValidScheduleId(
    schedules: Record<APIv4.ScheduleId, APIv4.UserSchedule>,
): APIv4.ScheduleId | null {
    const sorted = APIv4.getSchedulesSorted(schedules);
    if (sorted.length === 0) return null;
    return sorted[0]![0];
}

const init: Zustand.StateCreator<Store> = (set, get) => {
    function update(f: (store: Store) => void) {
        set(produce(f));
    }

    async function getUser() {
        const user = await apiFetch.getUser();

        const activeSchedule = get().activeScheduleId;
        if (activeSchedule !== null) {
            if (!Object.hasOwn(user.schedules, activeSchedule)) {
                set({ activeScheduleId: firstValidScheduleId(user.schedules) });
            }
        }

        set({
            schedules: user.schedules,
            server: pick("eppn", "school", "_id")(user),
        });
    }

    getUser().catch(() => {});

    return {
        activeScheduleId: "s~default",
        setActiveScheduleId: (activeScheduleId) => {
            const schedule = get().schedules[activeScheduleId];
            if (!schedule) {
                toast.error("invalid activeScheduleId");
                return;
            }
            set({ activeScheduleId, activeTerm: schedule.term });
        },
        activeTerm: CURRENT_TERM,
        setActiveTerm: (term) => {
            set({ activeTerm: term, activeScheduleId: null });
        },
        hasConfirmedGuest: false,
        schedules: {
            "s~default": {
                name: "Schedule 1",
                term: CURRENT_TERM,
                sections: [],
            } satisfies APIv4.UserSchedule,
        },
        server: null,
        scheduleAddSection: (request) => {
            if (get().server) apiFetch.addSection(request).catch(() => {});

            update((store) => {
                const schedule = get().schedules[request.scheduleId];
                if (schedule === undefined) {
                    toast.error(
                        "Attempting to add section to a non-existent schedule",
                    );
                } else if (
                    schedule.term.term !== request.section.term ||
                    schedule.term.year !== schedule.term.year
                ) {
                    toast.error(
                        `Cannot add section ${APIv4.stringifySectionCodeLong(
                            request.section,
                        )} to schedule in ${APIv4.stringifyTermIdentifier(
                            schedule.term,
                        )}`,
                    );
                    store.activeScheduleId = null;
                }
                store.schedules[request.scheduleId]!.sections.push({
                    section: request.section,
                    attrs: { selected: true },
                });
            });
        },
        scheduleDeleteSection: (request) => {
            if (get().server) apiFetch.deleteSection(request).catch(() => {});
            update((store) => {
                const schedule = store.schedules[request.scheduleId]!;
                schedule.sections = schedule.sections.filter(
                    (entry) =>
                        !APIv4.compareSectionIdentifier(
                            entry.section,
                            request.section,
                        ),
                );
            });
        },

        scheduleSetSections: (request) => {
            if (get().server) apiFetch.replaceSections(request).catch(() => {});
            update((store) => {
                store.schedules[request.scheduleId]!.sections =
                    request.sections;
            });
        },

        scheduleSetSectionAttrs: (request) => {
            if (get().server) apiFetch.setSectionAttrs(request).catch(() => {});
            update((store) => {
                store.schedules[request.scheduleId]!.sections.find((entry) =>
                    APIv4.compareSectionIdentifier(
                        entry.section,
                        request.section,
                    ),
                )!.attrs = request.attrs;
            });
        },
        confirmGuest: () => set({ hasConfirmedGuest: true }),
        addSchedule: async (request) => {
            let id: string;

            if (get().server) {
                const result = await apiFetch.addSchedule(request);
                id = result.scheduleId;
            } else {
                // some browsers don't have the randomUUID function
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                id = `s~${(window.crypto.randomUUID ?? Math.random)()}`;
            }
            const schedules = get().schedules;

            set({
                schedules: {
                    ...schedules,
                    [id]: {
                        name: request.name,
                        term: request.term,
                        sections: [],
                    },
                },
            });

            return id;
        },
        deleteSchedule: (request) => {
            if (get().server) apiFetch.deleteSchedule(request).catch(() => {});
            update((store) => {
                delete store.schedules[request.scheduleId];
                if (store.activeScheduleId === request.scheduleId)
                    store.activeScheduleId = null;
            });
        },
        renameSchedule: (request) => {
            if (get().server) apiFetch.renameSchedule(request).catch(() => {});
            update((store) => {
                const schedule = store.schedules[request.scheduleId];
                if (schedule === undefined) {
                    toast.error("Cannot rename a non-existent schedule");
                    console.error(
                        `Rename non-existent schedule ${request.scheduleId}`,
                    );
                    return;
                }
                schedule.name = request.name;
            });
        },

        duplicateSchedule: (request) => {
            toast.error("Not implemented");
            throw Error("Cannot duplicate schedule");
        },
    };
};

export const useUserStore = Zustand.create<Store>()(
    ZustandMiddleware.devtools(
        ZustandMiddleware.persist(init, {
            name: "hyperschedule-user",
            partialize: pick(
                "schedules",
                "hasConfirmedGuest",
                "activeScheduleId",
                "activeTerm",
            ),
        }),
    ),
);
