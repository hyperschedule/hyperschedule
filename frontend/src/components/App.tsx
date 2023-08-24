import * as React from "react";
import Css from "./App.module.css";

import * as ReactQuery from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import classNames from "classnames";

import ThemeSlider from "./ThemeSlider";
import CourseSearch from "./course-search/CourseSearch";
import Schedule from "./schedule/Schedule";
import MainSelector from "./MainSelector";
import Toolbar from "./Toolbar";
import Popup from "@components/popup/Popup";
import { ToastContainer, Slide } from "react-toastify";

import useStore, { MainTab } from "@hooks/store";
import Sidebar from "./Sidebar";

import "react-toastify/dist/ReactToastify.min.css";
import { useEffect } from "react";
import { useUserQuery } from "@hooks/api/user";

export default function App() {
    const theme = useStore((store) => store.theme);
    const mainTab = useStore((store) => store.mainTab);

    // we pass in schedule rendering options as props so we can make a screenshot of the schedule with only certain options
    // in the future
    const scheduleRenderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );

    const userQuery = useUserQuery();

    const activeScheduleId = useStore((store) => store.activeScheduleId);
    const setActiveScheduleId = useStore((store) => store.setActiveScheduleId);
    useEffect(() => {
        // we do this whole dance because we want to keep two different states: server-side activeScheduleId,
        // which is used to initialize the client-side activeScheduleId on page load, and the client-side activeScheduleId.
        // we want to save a server-state of activeScheduleId so the user can stay on the same schedule the next time they
        // visit hyperschedule. however, we don't want to, say, switch the active schedule and rerender everything on the
        // user's laptop when the user went to look at a different schedule on their phone and somehow triggered a server
        // sync.
        //
        // so, the client will keep updating the server about the activeSchedule, but will ignore everything received from
        // the server. this is why it's also ok for this function to fail fast and silently, as there is always *some*
        // active schedule set on the server.

        if (activeScheduleId === null && userQuery.data?.activeSchedule) {
            setActiveScheduleId(userQuery.data.activeSchedule);
        }
    }, [activeScheduleId, userQuery.data?.activeSchedule]);

    return (
        <div className={Css.app} data-theme={theme}>
            <Popup />
            <Toolbar />
            <div className={Css.main}>
                <MainSelector />
                <div
                    className={classNames(Css.mainContent, {
                        [Css.visible!]: mainTab === MainTab.CourseSearch,
                    })}
                >
                    <CourseSearch />
                </div>
                <div
                    className={classNames(Css.mainContent, {
                        [Css.visible!]: mainTab === MainTab.Schedule,
                    })}
                >
                    <Schedule {...scheduleRenderingOptions} />
                </div>
            </div>
            <Sidebar />
            <ThemeSlider />
            <ToastContainer
                position="top-center"
                hideProgressBar
                theme={theme}
                transition={Slide}
            />
        </div>
    );
}
