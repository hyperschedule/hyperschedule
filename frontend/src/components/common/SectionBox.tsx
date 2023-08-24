import useStore from "@hooks/store";
import { sectionColorStyle } from "@lib/color";
import type * as APIv4 from "hyperschedule-shared/api/v4";

export default function SectionBox(props: {
    section: APIv4.SectionIdentifier;
    children: JSX.Element;
}) {
    const theme = useStore((store) => store.theme);

    return (
        <div style={sectionColorStyle(props.section, theme)}>
            {props.children}
        </div>
    );
}
