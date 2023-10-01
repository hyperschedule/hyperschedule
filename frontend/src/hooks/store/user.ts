import * as Zustand from "zustand";
import * as ZustandMiddleware from "zustand/middleware";
import { produce } from "immer";

import * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

import { pick } from "@lib/store";

export type Store = {
    hasConfirmedGuest: boolean;
    schedules: Record<string, APIv4.UserSchedule>;
    server: Omit<APIv4.ServerUser, "schedules"> | null;
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
        schedules: {
            "s~default": {
                name: "Schedule 1",
                term: CURRENT_TERM,
                sections: [],
            } satisfies APIv4.UserSchedule,
        },
        server: null,
        scheduleAddSection: (request) =>
            update((store) => {
                store.schedules[request.scheduleId]!.sections.push({
                    section: request.section,
                    attrs: { selected: true },
                });
            }),
        scheduleDeleteSection: (request) =>
            update((store) => {
                const schedule = store.schedules[request.scheduleId]!;
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
                store.schedules[request.scheduleId]!.sections =
                    request.sections;
            }),
        scheduleSetSectionAttrs: (request) =>
            update((store) => {
                store.schedules[request.scheduleId]!.sections.find((entry) =>
                    APIv4.compareSectionIdentifier(
                        entry.section,
                        request.section,
                    ),
                )!.attrs = request.attrs;
            }),
        confirmGuest: () => set({ hasConfirmedGuest: true }),
        addSchedule: (request) => {
            const schedules = get().schedules;
            const id = `${Object.keys(schedules).length}`;
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
    };
};

export const useUserStore = Zustand.create<Store>()(
    ZustandMiddleware.devtools(
        ZustandMiddleware.persist(init, {
            name: "hyperschedule-user",
            partialize: pick("schedules", "hasConfirmedGuest"),
        }),
    ),
);
