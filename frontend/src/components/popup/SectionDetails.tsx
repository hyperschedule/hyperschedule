import * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./SectionDetails.module.css";
import CourseDescriptionBox from "@components/course-search/CourseDescriptionBox";
import { useUserStore } from "@hooks/store/user";
import { memo } from "react";

export default memo(function SectionDetails(props: {
    section: APIv4.Section | undefined;
}): JSX.Element {
    const activeTerm = useUserStore((store) => store.activeTerm);

    if (props.section === undefined) return <>Section data not found 😔</>;

    const fromActiveTerm =
        activeTerm.term === props.section.identifier.term &&
        activeTerm.year === props.section.identifier.year;
    return (
        <div className={Css.content}>
            <h3 className={Css.sectionTitle}>
                {(fromActiveTerm
                    ? APIv4.stringifySectionCode
                    : APIv4.stringifySectionCodeLong)(props.section.identifier)}
                : {props.section.course.title}
            </h3>

            <CourseDescriptionBox
                section={props.section}
                showStatus={fromActiveTerm}
            />
        </div>
    );
});
