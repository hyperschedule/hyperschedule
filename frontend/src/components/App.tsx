import * as React from "react";
import * as Css from "./App.module.css";

import ThemeSlider, { Theme } from "./ThemeSlider";

import CourseSearch from "./CourseSearch";
import Schedule from "./Schedule";

const enum MainTab {
    CourseSearch,
    Schedule,
}

export default function App() {
    const [theme, setTheme] = React.useState(Theme.Light);
    const [mainTab, setMainTab] = React.useState(MainTab.CourseSearch);

    return (
        <div className={theme === Theme.Dark ? Css.appDark : Css.app}>
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
                <div>
                    {mainTab === MainTab.CourseSearch ? (
                        <CourseSearch />
                    ) : (
                        <Schedule />
                    )}
                </div>
            </div>
            <div className={Css.sidebar}>
                <div className={Css.minimap}></div>
            </div>
            <ThemeSlider theme={theme} setTheme={setTheme} />
        </div>
    );
}
