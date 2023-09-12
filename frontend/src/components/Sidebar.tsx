import Css from "@components/Sidebar.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import useStore, { MainTab } from "@hooks/store";
import ScheduleControl from "@components/schedule/ScheduleControl";
import { shallow } from "zustand/shallow";
import * as Feather from "react-feather";

export default function Sidebar() {
    const { tab, show, setShow } = useStore(
        (store) => ({
            tab: store.mainTab,
            show: store.showSidebar,
            setShow: store.setShowSidebar,
        }),
        shallow,
    );

    return (
        <>
            <button className={Css.handle} onClick={() => setShow(true)}>
                <Feather.List />
            </button>
            <div
                className={Css.overlay}
                data-show={show || undefined}
                onClick={() => setShow(false)}
            />
            <div
                className={Css.sidebar}
                data-show={show || undefined}
                data-tab={tab}
            >
                <div className={Css.top}>
                    <button onClick={() => setShow(false)}>
                        <Feather.ChevronRight className={Css.icon} />
                    </button>
                </div>
                {tab === MainTab.CourseSearch ? (
                    <MiniMap />
                ) : (
                    <ScheduleControl />
                )}
                <SelectedList />
            </div>
        </>
    );
}
