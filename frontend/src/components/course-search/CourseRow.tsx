import { useEffect } from "react";

import { useMeasure } from "@react-hookz/web";
import classNames from "classnames";

import * as Api from "hyperschedule-shared/api/v4";
import Css from "./CourseRow.module.css";

import * as Feather from "react-feather";

import randomColor from "randomcolor";
import md5 from "md5";
import { stringifySectionCode } from "hyperschedule-shared/api/v4";
import CourseDescriptionBox from "@components/course-search/CourseDescriptionBox";

const statusBadge = {
    [Api.SectionStatus.open]: Css.badgeOpen,
    [Api.SectionStatus.closed]: Css.badgeClosed,
    [Api.SectionStatus.reopened]: Css.badgeReopened,
    [Api.SectionStatus.unknown]: Css.badgeUnknown,
};

export default function CourseRow(props: {
    section: Api.Section;
    expand: boolean;
    onClick?: () => void;
    updateDetailsSize?: (height: number) => void;
}) {
    const [detailsBounds, detailsRef] = useMeasure<HTMLDivElement>();
    const height = detailsBounds?.height ?? 0;

    useEffect(
        () => props.updateDetailsSize && props.updateDetailsSize(height),
        [height, props.updateDetailsSize],
    );

    const code = stringifySectionCode(props.section.identifier);

    const color = randomColor({
        hue: "random",
        luminosity: "light",
        seed: md5(code),
        format: "hex",
    });

    return (
        <div className={Css.padder}>
            <div
                className={classNames(Css.box, { [Css.expand!]: props.expand })}
                style={
                    {
                        "--course-color-light": color,
                        "--course-color-dark": `${color}60`,
                    } as React.CSSProperties
                }
            >
                <div className={Css.titlebar} onClick={props.onClick}>
                    <Feather.ChevronRight className={Css.arrow} size={12} />
                    <span className={Css.courseNumber}>
                        {stringifySectionCode(props.section.identifier)}
                    </span>
                    <span className={Css.title}>
                        {props.section.course.title}
                    </span>
                    <span className={Css.status}>
                        <span
                            className={classNames(
                                Css.badge,
                                statusBadge[props.section.status],
                            )}
                        />
                        <span className={Css.seatsFilled}>
                            {props.section.seatsFilled}
                        </span>
                        /
                        <span className={Css.seatsTotal}>
                            {props.section.seatsTotal}
                        </span>
                        seats filled
                        <span
                            className={classNames(Css.permCountLabel, {
                                [Css.nonzero!]: props.section.permCount !== 0,
                            })}
                        >
                            ,
                            <span className={Css.permCount}>
                                {props.section.permCount}
                            </span>
                            PERMs
                        </span>
                    </span>
                </div>
                <div
                    style={{ height: `${props.expand ? height : 0}px` }}
                    className={Css.expander}
                >
                    <div ref={detailsRef}>
                        <div className={Css.details}>
                            <CourseDescriptionBox
                                section={props.section}
                            ></CourseDescriptionBox>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
