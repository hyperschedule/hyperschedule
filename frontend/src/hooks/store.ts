import * as Zustand from "zustand";
import type * as Search from "@lib/search";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

type WithSetters<Shape> = { [K in keyof Shape]: Shape[K] } & {
    [K in keyof Shape as `set${Capitalize<string & K>}`]: (
        value: Shape[K],
    ) => void;
};

export type Store = WithSetters<{
    mainTab: MainTab;
    searchText: string;
    searchFilters: Search.Filter[];
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

export const enum PopupOption {
    Login = "login",
    SectionDetail = "SectionDetail",
    UserDetail = "UserDetail",
}

export type Popup =
    | {
          option: PopupOption.Login;
      }
    | {
          option: PopupOption.SectionDetail;
          section: APIv4.SectionIdentifier;
      }
    | {
          option: PopupOption.UserDetail;
      }
    | null;

export interface ScheduleRenderingOptions {
    hideConflicting: boolean;
    hideStatus: boolean;
}

const useStore = Zustand.create<Store>()((set, get) => ({
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
        newFilters[index] = filter;
        set({ searchFilters: newFilters });
    },
    addSearchFilter(filter) {
        const newFilters = get().searchFilters.slice();
        newFilters.push(filter);
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
}));
export default useStore;
