import * as React from "react";
import * as Css from "./App.module.css";

import ThemeSelector from "./ThemeSelector";

const enum MainTab {
    CourseSearch,
    Schedule,
}

export default function App() {
    const [darkMode, setDarkMode] = React.useState(false);
    const [mainTab, setMainTab] = React.useState(MainTab.CourseSearch);

    const selectorButtonClass = (tab: MainTab) =>
        mainTab === tab ? Css.selectorButtonActive : Css.selectorButton;

    return (
        <div className={darkMode ? Css.appDark : Css.app}>
            <div className={Css.main}>
                <div
                    className={
                        mainTab === MainTab.Schedule
                            ? Css.mainSelectorAlt
                            : Css.mainSelector
                    }
                >
                    <button
                        className={selectorButtonClass(MainTab.CourseSearch)}
                        onClick={() => setMainTab(MainTab.CourseSearch)}
                    >
                        Course Search
                    </button>
                    <button
                        className={selectorButtonClass(MainTab.Schedule)}
                        onClick={() => setMainTab(MainTab.Schedule)}
                    >
                        Schedule
                    </button>
                </div>
                <div></div>
            </div>
            <div className={Css.sidebar}></div>
            <ThemeSelector dark={darkMode} setDark={setDarkMode} />
        </div>
    );
}
