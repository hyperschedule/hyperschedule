import Css from "./MainSelector.module.css";

import classNames from "classnames";

import useStore, { MainTab } from "@hooks/store";

export default function MainSelector() {
    const mainTab = useStore((store) => store.mainTab);
    const setMainTab = useStore((store) => store.setMainTab);

    return (
        <div
            className={classNames(Css.container, {
                [Css.alt]: mainTab === MainTab.Schedule,
            })}
        >
            <button
                className={Css.courseSearchButton}
                onClick={() => setMainTab(MainTab.CourseSearch)}
            >
                Course Search
            </button>
            <button
                className={Css.scheduleButton}
                onClick={() => setMainTab(MainTab.Schedule)}
            >
                Schedule
            </button>
            <div className={Css.showSidebar} />
        </div>
    );
}
