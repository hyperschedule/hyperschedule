import createStore from "zustand";
import type * as Search from "@lib/search";
import type * as Api from "hyperschedule-shared/api/v4";

type WithSetters<Shape> = { [K in keyof Shape]: Shape[K] } & {
    [K in keyof Shape as `set${Capitalize<string & K>}`]: (
        value: Shape[K],
    ) => void;
};

export type Store = WithSetters<{
    mainTab: MainTab;
    searchText: string;
    expandKey: Api.SectionIdentifier | null;
    expandHeight: number;
    expandIndex: number | null;
}> & {
    theme: Theme;
    toggleTheme: () => void;

    clearExpand: () => void;
    setExpand: (expandKey: Api.SectionIdentifier, expandIndex: number) => void;

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

export default createStore<Store>((set, get) => ({
    mainTab: MainTab.CourseSearch,
    setMainTab: (mainTab) => set({ mainTab }),
    theme: Theme.Light,
    toggleTheme: () =>
        set({ theme: get().theme === Theme.Dark ? Theme.Light : Theme.Dark }),
    searchText: "",
    searchFilters: [],
    setSearchText: (searchText) => set({ searchText }),
    expandKey: null,
    setExpandKey: (expandKey) => set({ expandKey }),
    expandHeight: 0,
    setExpandHeight: (expandHeight) => set({ expandHeight }),
    expandIndex: null,
    setExpandIndex: (expandIndex) => set({ expandIndex }),
    clearExpand: () => set({ expandKey: null, expandIndex: null }),
    setExpand: (expandKey, expandIndex) => set({ expandKey, expandIndex }),
}));
