import createStore from "zustand";
import type * as Search from "@lib/search";

export interface Store {
    mainTab: MainTab;
    setMainTab: (tab: MainTab) => void;

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

export default createStore<Store>((set, get) => ({
    // TODO: are nested stores a thing? check zustand docs
    mainTab: MainTab.CourseSearch,
    setMainTab: (mainTab) => set({ mainTab }),
    search: {
        text: "",
        setText: (text) => set({ search: { ...get().search, text } }),
        filters: [],
    },
}));
