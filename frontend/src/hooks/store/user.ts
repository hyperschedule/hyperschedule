import * as Zustand from "zustand";
import * as ZustandMiddleware from "zustand/middleware";
import { produce } from "immer";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { pick } from "@lib/store";

export type Store = {
    hasConfirmedGuest: boolean;
    schedule: Record<string, APIv4.UserSchedule>;
    serverUser: {
        id: APIv4.UserId;
        eppn: string;
        school: APIv4.School;
    } | null;
    // mutators
    confirmGuest: () => void;
    scheduleAddSection: (request: APIv4.AddSectionRequest) => void;
    scheduleDeleteSection: (request: APIv4.DeleteSectionRequest) => void;
    scheduleSetSections: (request: APIv4.ReplaceSectionsRequest) => void;
    scheduleSetSectionAttrs: (request: APIv4.SetSectionAttrRequest) => void;
    addSchedule: (request: APIv4.AddScheduleRequest) => string;
};

const init: Zustand.StateCreator<Store> = (set, get) => {
    function update(f: (store: Store) => void) {
        set(produce(f));
    }

    return {
        hasConfirmedGuest: false,
        schedule: {},
        serverUser: null,
        scheduleAddSection: (request) =>
            update((store) => {
                store.schedule[request.scheduleId]!.sections.push({
                    section: request.section,
                    attrs: { selected: true },
                });
            }),
        scheduleDeleteSection: (request) =>
            update((store) => {
                const schedule = store.schedule[request.scheduleId]!;
                schedule.sections = schedule.sections.filter(
                    (entry) =>
                        !APIv4.compareSectionIdentifier(
                            entry.section,
                            request.section,
                        ),
                );
            }),
        scheduleSetSections: (request) =>
            update((store) => {
                store.schedule[request.scheduleId]!.sections = request.sections;
            }),
        scheduleSetSectionAttrs: (request) =>
            update((store) => {
                store.schedule[request.scheduleId]!.sections.find((entry) =>
                    APIv4.compareSectionIdentifier(
                        entry.section,
                        request.section,
                    ),
                )!.attrs = request.attrs;
            }),
        confirmGuest: () => set({ hasConfirmedGuest: true }),
        addSchedule: (request) => {
            const schedule = get().schedule;
            const id = `${Object.keys(schedule).length}`;
            set({
                schedule: {
                    ...schedule,
                    [id]: {
                        name: request.name,
                        term: request.term,
                        sections: [],
                    },
                },
            });
            return id;
        },
    };
};

export const useUserStore = Zustand.create<Store>()(
    ZustandMiddleware.devtools(
        ZustandMiddleware.persist(init, {
            name: "hyperschedule-user",
            partialize: pick("schedule", "serverUser", "hasConfirmedGuest"),
        }),
    ),
);
