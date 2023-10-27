import * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./SectionDetails.module.css";
import CourseDescriptionBox from "@components/course-search/CourseDescriptionBox";
import { useActiveSectionsLookup } from "@hooks/section";
import { useUserStore } from "@hooks/store/user";
import { memo } from "react";

export default memo(function SectionDetails(props: {
    section: APIv4.SectionIdentifier;
}): JSX.Element {
    const activeTerm = useUserStore((store) => store.activeTerm);

    const lookup = useActiveSectionsLookup();
    const s = lookup.get(APIv4.stringifySectionCodeLong(props.section));
    if (s === undefined) return <>Section data not found 😔</>;
    return (
        <div className={Css.content}>
            <h3 className={Css.sectionTitle}>
                {(activeTerm.term === props.section.term &&
                    activeTerm.year === props.section.year
                    ? APIv4.stringifySectionCode
                    : APIv4.stringifySectionCodeLong)(props.section)}
                : {s.course.title}
            </h3>

            <CourseDescriptionBox section={s} showStatus={true} />
        </div>
    );
});
