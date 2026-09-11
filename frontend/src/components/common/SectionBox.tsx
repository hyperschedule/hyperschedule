import useStore from "@hooks/store";
import { sectionColorStyle } from "@lib/color";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { useActiveSectionsLookup } from "@hooks/section";


export default function SectionBox(props: {
    section: APIv4.SectionIdentifier;
    children: JSX.Element;
}) {
    const theme = useStore((store) => store.theme);
    const courseColorTheme = useStore(
        (store) => store.appearanceOptions.courseColorTheme,
    );

    const sectionsLookup = useActiveSectionsLookup();
    const section = sectionsLookup.get(
            APIv4.stringifySectionCodeLong(props.section),
        );

    return (
        <div
            style={sectionColorStyle(
                props.section,
                theme,
                courseColorTheme,
                section?.course.primaryAssociation ?? "monochrome",
                false,
            )}
        >
            {props.children}
        </div>
    );
}
