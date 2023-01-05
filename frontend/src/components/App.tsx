import * as React from "react";
import * as Css from "./App.module.css";

import * as ReactQuery from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import classNames from "classnames";

import ThemeSlider, { Theme } from "./ThemeSlider";
import CourseSearch from "./CourseSearch";
import Schedule from "./Schedule";

const enum MainTab {
    CourseSearch = 0,
    Schedule = 1,
}

export default function App() {
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);

    const [theme, setTheme] = React.useState(Theme.Light);
    const [mainTab, setMainTab] = React.useState(MainTab.CourseSearch);

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
