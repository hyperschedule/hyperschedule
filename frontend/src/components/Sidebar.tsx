import Css from "@components/Sidebar.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import useStore, { MainTab } from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import ScheduleControl from "@components/schedule/ScheduleControl";
import { shallow } from "zustand/shallow";
import * as Feather from "react-feather";
import ThemeSlider from "./ThemeSlider";
import Dropdown from "@components/common/Dropdown";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { useMeasure } from "@react-hookz/web";

function scheduleDisplayName(schedule: APIv4.UserSchedule) {
    return `${schedule.name} (${APIv4.stringifyTermIdentifier(schedule.term)})`;
}

export default function Sidebar() {
    const { tab, show, setShow } = useStore(
        (store) => ({
            tab: store.mainTab,
            show: store.showSidebar,
            setShow: store.setShowSidebar,
        }),
        shallow,
    );

    const user = useUserStore();

    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);
    const serverData = useUserStore((user) => user.server);

    const schedules = APIv4.getSchedulesSorted(user.schedules);

    const scheduleChoices = schedules.map((s) => scheduleDisplayName(s[1]));
    const selectedSchedule =
        user.activeScheduleId === null
            ? ""
            : scheduleDisplayName(user.schedules[user.activeScheduleId]!);

    const [textMeasure, textRef] = useMeasure<HTMLSpanElement>();
    const [containerMeasure, containerRef] = useMeasure<HTMLDivElement>();

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

                {serverData === null && !confirmedGuest ? (
                    <></>
                ) : (
                    <div className={Css.scheduleSelect} ref={containerRef}>
                        <div className={Css.dropdownContainer}>
                            <span className={Css.dropdownLabel}>
                                Select a{" "}
                                {(containerMeasure?.width ?? 0) / 3 >
                                (textMeasure?.width ?? 0) ? (
                                    <></>
                                ) : (
                                    <br />
                                )}{" "}
                                schedule
                            </span>
                            <span className={Css.mirror} ref={textRef}>
                                Select a schedule
                            </span>

                            <Dropdown
                                choices={scheduleChoices}
                                selected={selectedSchedule}
                                emptyPlaceholder="no schedule selected"
                                onSelect={(index) =>
                                    user.setActiveScheduleId(
                                        schedules[index]![0],
                                    )
                                }
                            />
                        </div>
                        <button className={Css.editScheduleButton}>
                            <Feather.Edit className={Css.editIcon} />
                            edit
                        </button>
                    </div>
                )}

                <ThemeSlider />
            </div>
        </>
    );
}
