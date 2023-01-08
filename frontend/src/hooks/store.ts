import createStore from "zustand";
import type * as Search from "@lib/search";

export interface Store {
    mainTab: MainTab;
    setMainTab: (tab: MainTab) => void;

    theme: Theme;
    toggleTheme: () => void;

    search: {
        text: string;
        setText: (text: string) => void;
        filters: Search.Filter[];
    };
}

export const enum MainTab {
    CourseSearch = "CourseSearch",
    Schedule = "Schedule",
}

export const enum Theme {
    Dark = "dark",
    Light = "light",
}

export default createStore<Store>((set, get) => ({
    mainTab: MainTab.CourseSearch,
    setMainTab: (mainTab) => set({ mainTab }),
    theme: Theme.Dark,
    toggleTheme: () =>
        set({ theme: get().theme === Theme.Dark ? Theme.Light : Theme.Dark }),
    search: {
        text: "",
        filters: [],
    },
}));
