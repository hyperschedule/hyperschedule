import * as Zustand from "zustand";
import * as ZustandMiddleware from "zustand/middleware";

import type * as Search from "@lib/search";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { Popup } from "@lib/popup";
import type { WithSetters } from "@lib/store";
import { pick } from "@lib/store";
import { MAIN_STORE_NAME } from "@lib/constants";

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

    popup: Popup;
    scheduleRenderingOptions: ScheduleRenderingOptions;
    showSidebar: boolean;
    scrollToSection: (section: APIv4.SectionIdentifier) => void;
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
    showConflicting: boolean;
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

    popup: null,
    setPopup: (popup) => set({ popup }),

    showSidebar: false,
    setShowSidebar: (showSidebar) => set({ showSidebar }),

    scheduleRenderingOptions: { showConflicting: false, showDetails: false },
    setScheduleRenderingOptions: (options) =>
        set({ scheduleRenderingOptions: options }),

    scrollToSection: () => {},
    setScrollToSection: (section) => set({ scrollToSection: section }),
});

const useStore = Zustand.create<Store>()(
    ZustandMiddleware.devtools(
        ZustandMiddleware.persist(initStore, {
            name: MAIN_STORE_NAME,
            partialize: pick("mainTab", "scheduleRenderingOptions", "theme"),
        }),
    ),
);

export default useStore;
