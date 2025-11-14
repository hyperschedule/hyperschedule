import type * as APIv4 from "hyperschedule-shared/api/v4";
import { toast } from "react-toastify";

/**
 * Formats a course code for portal search: "PHIL144", "PSYC051" (no spaces, zero-padded)
 */
export const formatCourseCodeForPortal = (
    section: APIv4.SectionIdentifier,
): string => {
    const paddedDepartment = section.department.padEnd(4, " ");
    const paddedNumber = section.courseNumber.toString().padStart(3, "0");
    return `${paddedDepartment}${paddedNumber}${section.suffix}`;
};

/**
 * Copies a basic course code (department + number only) to clipboard.
 * Formats for portal search: "PHIL144", "PSYC051" (no spaces, zero-padded)
 */
export const copyBasicCourseCode = (section: APIv4.SectionIdentifier): void => {
    const basicCourseCode = formatCourseCodeForPortal(section);

    navigator.clipboard.writeText(basicCourseCode).then(
        () => {
            toast.success(`Copied ${basicCourseCode} to clipboard`);
        },
        () => {
            toast.error("Failed to copy course code");
        },
    );
};
