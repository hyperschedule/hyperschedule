import * as APIv4 from "hyperschedule-shared/api/v4";

import CourseDescriptionBox from "@components/course-search/CourseDescriptionBox";
import { useActiveSectionsLookup } from "@hooks/section";

export default function SectionDetails(props: {
    section: APIv4.SectionIdentifier;
}): JSX.Element {
    const lookup = useActiveSectionsLookup();
    const s = lookup.get(APIv4.stringifySectionCodeLong(props.section));
    if (s === undefined) return <>Section data not found</>;
    return <CourseDescriptionBox section={s} />;
}
