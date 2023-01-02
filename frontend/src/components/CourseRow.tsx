import { useMeasure } from "@react-hookz/web";

import type * as Api from "hyperschedule-shared/api/v4";
import * as Css from "./CourseRow.module.css";

import randomColor from "randomcolor";
import md5 from "md5";

export default function CourseRow(props: {
    section: Api.Section;
    expand: boolean;
    onClick?: (height: number) => void;
}) {
    const [detailsBounds, detailsRef] = useMeasure<HTMLDivElement>();

    const style = {
        height: props.expand ? `${detailsBounds?.height ?? 0}px` : "0",
    };

    const code = `${props.section.course.code.department}${props.section.course.code.courseNumber}${props.section.course.code.suffix} ${props.section.course.code.affiliation}`;

    const color = randomColor({
        hue: "random",
        luminosity: "light",
        seed: md5(code),
        format: "hex",
    });

    return (
        <div className={Css.padder} data-height={detailsBounds?.height}>
            <div
                className={Css.box}
                style={
                    {
                        "--course-color": color,
                    } as React.CSSProperties
                }
            >
                <div
                    className={Css.titlebar}
                    onClick={() =>
                        props.onClick &&
                        props.onClick(detailsBounds?.height ?? 0)
                    }
                >
                    {props.section.course.code.department}{" "}
                    {props.section.course.code.courseNumber
                        .toString()
                        .padStart(3, "0")}{" "}
                    {props.section.course.code.affiliation}-
                    {props.section.identifier.sectionNumber
                        .toString()
                        .padStart(2, "0")}{" "}
                    {props.section.course.title}
                </div>
                <div style={style} className={Css.expander}>
                    <div ref={detailsRef}>
                        <div className={Css.details}>
                            {props.section.course.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
