import * as React from "react";
import Css from "./App.module.css";

import classNames from "classnames";

import CourseSearch from "./course-search/CourseSearch";
import Schedule from "./schedule/Schedule";
import MainSelector from "./MainSelector";
import Popup from "@components/popup/Popup";
import { Slide, ToastContainer } from "react-toastify";

import useStore, { MainTab } from "@hooks/store";
import Sidebar from "./Sidebar";

import "react-toastify/dist/ReactToastify.min.css";

export default function App() {
    const theme = useStore((store) => store.theme);
    const mainTab = useStore((store) => store.mainTab);
    const appearanceOptions = useStore((store) => store.appearanceOptions);

    // we pass in schedule rendering options as props so we can make a screenshot of the schedule with only certain options
    // in the future
    const scheduleRenderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );

    const onSearchTab = mainTab === MainTab.Schedule;

    return (
        <div
            className={classNames(Css.app, {
                [Css.disableShadows]: appearanceOptions.disableShadows,
                [Css.disableTransparency]:
                    appearanceOptions.disableTransparency,
                [Css.disableRoundedCorners]:
                    appearanceOptions.disableRoundedCorners,
                [Css.disableAnimations]: appearanceOptions.disableAnimations,
            })}
            data-theme={theme}
            data-schedule-tab={onSearchTab ? "" : undefined}
            data-search-tab={!onSearchTab ? "" : undefined}
        >
            <Popup />
            <div className={Css.main}>
                <MainSelector />
                <div
                    className={classNames(Css.mainContent, {
                        [Css.hidden]: onSearchTab,
                    })}
                >
                    <CourseSearch />
                </div>
                <div
                    className={classNames(Css.mainContent, {
                        [Css.hidden]: !onSearchTab,
                    })}
                >
                    <Schedule {...scheduleRenderingOptions} />
                </div>
            </div>
            <Sidebar />
            <ToastContainer
                position="top-center"
                // hideProgressBar
                theme={theme}
                transition={Slide}
                pauseOnHover={true}
                pauseOnFocusLoss={true}
            />
        </div>
    );
}
