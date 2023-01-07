import * as React from "react";
import * as Css from "./App.module.css";

import * as ReactQuery from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import classNames from "classnames";

import ThemeSlider, { Theme } from "./ThemeSlider";
import CourseSearch from "./course-search/CourseSearch";
import Schedule from "./Schedule";

import useStore, { MainTab } from "@hooks/store";

export default function App() {
    // memoize `queryClient` with empty dependency list to ensure it only gets
    // constructed/initialized once throughout the app's lifecycle
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);

    const [theme, setTheme] = React.useState(Theme.Light);

    const mainTab = useStore((store) => store.mainTab);
    const setMainTab = useStore((store) => store.setMainTab);

    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <div className={Css.app} data-theme={theme}>
                <div className={Css.main}>
                    <div
                        className={
                            mainTab === MainTab.Schedule
                                ? Css.mainSelectorAlt
                                : Css.mainSelector
                        }
                    >
                        <button
                            className={Css.selectorButton}
                            onClick={() => setMainTab(MainTab.CourseSearch)}
                        >
                            Course Search
                        </button>
                        <button
                            className={Css.selectorButton}
                            onClick={() => setMainTab(MainTab.Schedule)}
                        >
                            Schedule
                        </button>
                    </div>
                    <div
                        className={classNames(Css.mainContent, {
                            [Css.visible]: mainTab === MainTab.CourseSearch,
                        })}
                    >
                        <CourseSearch />
                    </div>
                    <div
                        className={classNames(Css.mainContent, {
                            [Css.visible]: mainTab === MainTab.Schedule,
                        })}
                    >
                        <Schedule />
                    </div>
                </div>
                <div className={Css.sidebar}>
                    <div className={Css.minimap}></div>
                </div>
                <ThemeSlider theme={theme} setTheme={setTheme} />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </ReactQuery.QueryClientProvider>
    );
}
