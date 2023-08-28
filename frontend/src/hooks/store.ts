import * as Zustand from "zustand";
import type * as Search from "@lib/search";
import type * as APIv4 from "hyperschedule-shared/api/v4";

type WithSetters<Shape> = { [K in keyof Shape]: Shape[K] } & {
    [K in keyof Shape as `set${Capitalize<string & K>}`]: (
        value: Shape[K],
    ) => void;
};

export type Store = WithSetters<{
    mainTab: MainTab;
    searchText: string;
    expandKey: APIv4.SectionIdentifier | null;
    expandHeight: number;
    activeScheduleId: APIv4.ScheduleId | null;
    popup: Popup;
    scheduleRenderingOptions: ScheduleRenderingOptions;
    showSidebar: boolean;
}> & {
    theme: Theme;
    toggleTheme: () => void;

    clearExpand: () => void;
    searchFilters: Search.Filter[];
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
    | { option: PopupOption.Login }
    | { option: PopupOption.SectionDetail; section: APIv4.SectionIdentifier }
    | { option: PopupOption.UserDetail }
    | null;

export interface ScheduleRenderingOptions {
    hideConflicting: boolean;
    hideStatus: boolean;
}

export default Zustand.create<Store>((set, get) => ({
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
    searchFilters: [],
    setSearchText: (searchText) =>
        set({ searchText, expandKey: null, expandHeight: 0 }),
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
}));
