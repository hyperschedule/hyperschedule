import * as APIv4 from "hyperschedule-shared/api/v4";
import { useCourseAreaDescription } from "@hooks/api";

function mapDescriptions(
    code: string[],
    descriptions: Map<string, string>,
): string[] {
    return code.map((c) => descriptions.get(c) ?? c);
}

function computeCredits(section: APIv4.Section): number {
    if (
        section.course.primaryAssociation === APIv4.School.HMC ||
        section.credits >= 3
    )
        return section.credits;
    return section.credits * 3;
}

export default function CourseDescriptionBox(props: {
    section: APIv4.Section;
}) {
    const descriptions = useCourseAreaDescription();
    if (!descriptions.isFetched) return <></>;
    return (
        <>
            <p>
                <strong>HMC credits</strong>:{computeCredits(props.section)}
            </p>
            <p>
                <strong>
                    Instructor{props.section.instructors.length > 1 ? "s" : ""}
                </strong>
            </p>
            <ul>
                {props.section.instructors.map((i) => (
                    <li>{i.name}</li>
                ))}
            </ul>
            <p> {props.section.course.description}</p>
            <strong>Course Areas</strong>:
            <ul>
                {mapDescriptions(
                    props.section.courseAreas,
                    descriptions.data!,
                ).map((d) => (
                    <li key={d}>{d}</li>
                ))}
            </ul>
        </>
    );
}
