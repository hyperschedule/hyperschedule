import * as Zustand from "zustand";
import * as ZustandMiddleware from "zustand/middleware";

import type * as Search from "@lib/search";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import type { Popup } from "@lib/popup";
import type { WithSetters } from "@lib/store";

// we need this so we can correctly render filters with immutable keys.
// without this there are subtle bugs with filter deletions
let filterKeyCount = 0;
type StoreFilter = {
    filter: Search.Filter;
    key: number;
};

export type Store = WithSetters<{
    mainTab: MainTab;
    searchText: string;
    searchFilters: StoreFilter[];
    expandKey: APIv4.SectionIdentifier | null;
    expandHeight: number;
    activeScheduleId: APIv4.ScheduleId | null;
    popup: Popup;
    scheduleRenderingOptions: ScheduleRenderingOptions;
    showSidebar: boolean;
    scrollToSection: (section: APIv4.SectionIdentifier) => void;
    activeTerm: APIv4.TermIdentifier;
}> & {
    theme: Theme;
    toggleTheme: () => void;

    clearExpand: () => void;
    addSearchFilter: (filter: Search.Filter) => void;
    setSearchFilter: (index: number, filter: Search.Filter) => void;
    removeSearchFilter: (index: number) => void;
};

export const enum MainTab {
    CourseSearch = "CourseSearch",
    Schedule = "Schedule",
}

export const enum Theme {
    Dark = "dark",
    Light = "light",
}

export interface ScheduleRenderingOptions {
    hideConflicting: boolean;
    hideStatus: boolean;
}

const initStore: Zustand.StateCreator<Store> = (set, get) => ({
    mainTab: MainTab.CourseSearch,
    setMainTab: (mainTab) => set({ mainTab }),
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? Theme.Dark
        : Theme.Light,
    toggleTheme: () =>
        set({
            theme: get().theme === Theme.Dark ? Theme.Light : Theme.Dark,
        }),

    searchText: "",
    setSearchText: (searchText) =>
        set({ searchText, expandKey: null, expandHeight: 0 }),

    searchFilters: [],
    setSearchFilters: (searchFilters) => set({ searchFilters }),
    setSearchFilter(index, filter) {
        const newFilters = get().searchFilters.slice();
        const sf = newFilters[index];
        if (sf === undefined) {
            console.error(
                "Nonexistent search index %d supplied to all filters %o",
                index,
                newFilters,
            );
            return;
        }
        sf.filter = filter;
        set({ searchFilters: newFilters });
    },
    addSearchFilter(filter) {
        const newFilters = get().searchFilters.slice();
        newFilters.push({ filter, key: filterKeyCount++ });
        set({ searchFilters: newFilters });
    },
    removeSearchFilter: (index) => {
        const newFilters = get().searchFilters.slice();
        newFilters.splice(index, 1);
        set({ searchFilters: newFilters });
    },

    expandKey: null,
    setExpandKey: (expandKey) => set({ expandKey }),
    expandHeight: 0,
    setExpandHeight: (expandHeight) => set({ expandHeight }),
    clearExpand: () => set({ expandKey: null, expandHeight: 0 }),
    activeScheduleId: null,
    setActiveScheduleId: (activeScheduleId) => {
        // don't use this function directly, use useActiveScheduleMutation from @hooks/api/user.ts instead
        set({ activeScheduleId });
    },
    popup: null,
    setPopup: (popup) => set({ popup }),

    showSidebar: false,
    setShowSidebar: (showSidebar) => set({ showSidebar }),

    scheduleRenderingOptions: { hideConflicting: false, hideStatus: false },
    setScheduleRenderingOptions: (options) =>
        set({ scheduleRenderingOptions: options }),

    scrollToSection: () => {},
    setScrollToSection: (section) => set({ scrollToSection: section }),

    activeTerm: CURRENT_TERM,
    setActiveTerm: (term) => {
        set({ activeTerm: term, activeScheduleId: null });
    },
});

const useStore = Zustand.create<Store>()(
    ZustandMiddleware.devtools(
        ZustandMiddleware.persist(initStore, {
            name: "hyperschedule-store",
            partialize: (store) => ({
                mainTab: store.mainTab,
                activeTerm: store.activeTerm,
            }),
        }),
    ),
);

export default useStore;
