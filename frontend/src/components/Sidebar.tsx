import Css from "@components/Sidebar.module.css";
import AppCss from "@components/App.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import useStore, { MainTab } from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import { shallow } from "zustand/shallow";
import * as Feather from "react-feather";
import ThemeSlider from "./ThemeSlider";
import Dropdown from "@components/common/Dropdown";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Slider from "@components/common/Slider";
import { PopupOption } from "@lib/popup";
import classNames from "classnames";

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

    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);
    const serverData = useUserStore((user) => user.server);

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
                {tab === MainTab.CourseSearch ? <MiniMap /> : <></>}

                {serverData === null && !confirmedGuest ? (
                    <></>
                ) : (
                    <>
                        <ScheduleSelect />
                        <SelectedList />

                        <ScheduleRendering />
                    </>
                )}
                <ThemeSlider />
            </div>
        </>
    );
}

function ScheduleSelect() {
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);
    const setActiveScheduleId = useUserStore(
        (store) => store.setActiveScheduleId,
    );
    const userSchedules = useUserStore((store) => store.schedules);
    const setPopup = useStore((store) => store.setPopup);

    const sortedSchedules = APIv4.getSchedulesSorted(userSchedules);
    const scheduleChoices = sortedSchedules.map((s) =>
        scheduleDisplayName(s[1]),
    );
    const selectedSchedule =
        activeScheduleId === null
            ? ""
            : scheduleDisplayName(userSchedules[activeScheduleId]!);
    return (
        <div className={Css.scheduleSelect}>
            <Feather.List className={Css.scheduleIcon} />
            <div className={Css.dropdownContainer}>
                <Dropdown
                    choices={scheduleChoices}
                    selected={selectedSchedule}
                    emptyPlaceholder="no schedule selected"
                    onSelect={(index) =>
                        setActiveScheduleId(sortedSchedules[index]![0])
                    }
                />
            </div>
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.editScheduleButton,
                )}
                onClick={() =>
                    setPopup({ option: PopupOption.ManageSchedules })
                }
            >
                <Feather.Edit className={AppCss.defaultButtonIcon} />
                Edit
            </button>
        </div>
    );
}

function ScheduleRendering() {
    const options = useStore((store) => store.scheduleRenderingOptions);
    const setOptions = useStore((store) => store.setScheduleRenderingOptions);

    return (
        <div className={Css.renderingOptions}>
            <Slider
                value={options.showConflicting}
                text="show conflicting sections"
                onToggle={() => {
                    setOptions({
                        ...options,
                        showConflicting: !options.showConflicting,
                    });
                }}
            />
        </div>
    );
}
