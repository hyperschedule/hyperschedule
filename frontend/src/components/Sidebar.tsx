import Css from "@components/Sidebar.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import useStore, { MainTab } from "@hooks/store";
import ScheduleControl from "@components/schedule/ScheduleControl";

export default function Sidebar() {
    const tab = useStore((store) => store.mainTab);

    if (tab === MainTab.CourseSearch)
        return (
            <div className={Css.sidebar}>
                <MiniMap />
                <SelectedList />
            </div>
        );
    else
        return (
            <div className={Css.sidebar}>
                <ScheduleControl />
                <SelectedList />
            </div>
        );
}
