import * as APIv4 from "hyperschedule-shared/api/v4";

import CourseRow from "@components/course-search/CourseRow";
import { useActiveSectionsLookup } from "@hooks/section";

export default function (props: {
    section: APIv4.SectionIdentifier;
}): JSX.Element {
    const lookup = useActiveSectionsLookup();
    const s = lookup.get(APIv4.stringifySectionCodeLong(props.section));
    if (s === undefined) return <>Section data not found</>;
    return <CourseRow section={s} expand={true} />;
}
