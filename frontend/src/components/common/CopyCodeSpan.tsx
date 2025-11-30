import { copyBasicCourseCode, formatCourseCodeForPortal } from "@lib/clipboard";
import { memo } from "react";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./CopyCodeSpan.module.css";

export default memo(function CopyCodeSpan(props: {
    section: APIv4.SectionIdentifier;
}) {
    const handleCopy = (event: React.MouseEvent) => {
        event.stopPropagation();
        copyBasicCourseCode(props.section);
    };

    return (
        <span className={Css.copyCodeSpan}>
            <span
                className={Css.courseNumber}
                onClick={handleCopy}
                title={`Click to copy: ${formatCourseCodeForPortal(
                    props.section,
                )}`}
            >
                {APIv4.stringifySectionCode(props.section)}
            </span>
        </span>
    );
});
