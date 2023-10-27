import { useEffect } from "react";

import { useMeasure } from "@react-hookz/web";
import classNames from "classnames";

import * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./CourseRow.module.css";

import * as Feather from "react-feather";

import CourseDescriptionBox from "@components/course-search/CourseDescriptionBox";
import SectionStatusBadge from "@components/common/SectionStatusBadge";

import { useUserStore } from "@hooks/store/user";
import { useActiveScheduleLookup } from "@hooks/schedule";
import useStore from "@hooks/store";
import { sectionColorStyle } from "@lib/color";
import { toast } from "react-toastify";
import { PopupOption } from "@lib/popup";
import { pick } from "@lib/store";
import { DEFAULT_LOCAL_SCHEDULE_ID } from "@lib/constants";
import { memo } from "react";

export default memo(function CourseRow(props: {
    section: APIv4.Section;
    expand: boolean;
    onClick?: () => void;
    updateDetailsSize?: (height: number) => void;
}) {
    const [detailsBounds, detailsRef] = useMeasure<HTMLDivElement>();
    const height = detailsBounds?.height ?? 0;
    const theme = useStore((store) => store.theme);

    useEffect(() => {
        if (!props.updateDetailsSize || !detailsBounds || !props.expand) return;
        props.updateDetailsSize(detailsBounds.height);
    }, [detailsBounds?.height, props.updateDetailsSize, props.expand]);

    return (
        <div className={Css.padder}>
            <div
                className={classNames(Css.box, { [Css.expand!]: props.expand })}
                style={sectionColorStyle(
                    props.section.identifier,
                    theme,
                    false,
                )}
            >
                <div className={Css.titlebar} onClick={props.onClick}>
                    <Feather.ChevronRight className={Css.arrow} size={14} />
                    <span className={Css.summary}>
                        <span className={Css.courseNumber}>
                            {APIv4.stringifySectionCode(
                                props.section.identifier,
                            )}
                        </span>
                        <span className={Css.title}>
                            {props.section.course.title}
                        </span>
                    </span>
                    <span className={Css.status}>
                        <SectionStatusBadge status={props.section.status} />
                        <span className={Css.seats}>
                            <span
                                className={classNames(Css.permCountLabel, {
                                    [Css.nonzero!]:
                                        props.section.permCount !== 0,
                                })}
                            >
                                <span className={Css.permCount}>
                                    {props.section.permCount}
                                </span>
                                PERMs,
                            </span>
                            <span className={Css.seatsFilled}>
                                {props.section.seatsFilled}
                            </span>
                            /
                            <span className={Css.seatsTotal}>
                                {props.section.seatsTotal}
                            </span>
                            seats filled
                        </span>
                    </span>
                    <ToggleButton section={props.section.identifier} />
                </div>
                <div
                    style={{ height: `${props.expand ? height : 0}px` }}
                    className={Css.expander}
                >
                    {
                        // It's important that the measure component (`detailsRef`) is conditionally rendered _together with_ the
                        // actual description box; this way, the measurement is only ever non-null when the description box
                        // exists. Otherwise, we run into split-second glitches where, upon clicking to expand
                        // a course, first the measurement div appears, and the `detailsRef` gets attached, but
                        // the actual description box itself _hasn't_ appeared, so the measurement div only
                        // measures an empty box (i.e., the padding dimensions), updates that, and then screws up
                        // a bunch of the placement/size calculations (causing elements to teleport, or
                        // shift unexpectedly). By keeping the measurement div _together_ with the description
                        // box, measurements are guaranteed to be valid--i.e., we are never accidentally measuring
                        // a split-second empty container.

                        // In another universe, where React render cycles/timings are more predictable, maybe this wouldn't
                        // matter—i.e., shouldn't it be the case that, as soon as `props.expand` becomes true, the description box
                        // gets actually rendered before any new measurements/state changes/effects are performed? Maybe, but
                        // it's too difficult to actually reason through exactly what's going on, and easier to just do this—
                        // which, anyway, has the advantage of being more robust/independent of actual render lifecycle timings.
                        props.expand ? (
                            <div ref={detailsRef}>
                                <div className={Css.details}>
                                    <CourseDescriptionBox
                                        section={props.section}
                                        showStatus={false}
                                    ></CourseDescriptionBox>
                                </div>
                            </div>
                        ) : null
                    }
                </div>
            </div>
        </div>
    );
});

const ToggleButton = memo(function ToggleButton(props: {
    section: APIv4.SectionIdentifier;
}) {
    const user = useUserStore(
        pick(
            "server",
            "hasConfirmedGuest",
            "scheduleAddSection",
            "scheduleDeleteSection",
            "addSchedule",
        ),
    );
    const activeScheduleLookup = useActiveScheduleLookup();
    const setPopup = useStore((store) => store.setPopup);
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);

    const inSchedule = activeScheduleLookup.has(
        APIv4.stringifySectionCodeLong(props.section),
    );

    return (
        <button
            className={Css.toggle}
            onClick={(event) => {
                event.stopPropagation();

                // not logged in, and i haven't confirmed i want to proceed as guest
                if (user.server === null && !user.hasConfirmedGuest) {
                    setPopup({
                        option: PopupOption.Login,
                        continuation: () => {
                            user.scheduleAddSection({
                                scheduleId: DEFAULT_LOCAL_SCHEDULE_ID,
                                section: props.section,
                            });
                        },
                    });
                    return;
                }

                if (activeScheduleId === null) {
                    toast.error(
                        "No schedule selected. Please select a schedule",
                    );
                    return;
                }

                (inSchedule
                    ? user.scheduleDeleteSection
                    : user.scheduleAddSection)({
                    scheduleId: activeScheduleId,
                    section: props.section,
                });
            }}
        >
            {inSchedule ? <Feather.X size={14} /> : <Feather.Plus size={14} />}
        </button>
    );
});
