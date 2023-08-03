import * as APIv4 from "hyperschedule-shared/api/v4";
import { useCourseAreaDescription } from "@hooks/api";

import Css from "./CourseDescriptionBox.module.css";

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
    if (!descriptions.data) return <></>;

    return (
        <>
            <p className={Css.description}>
                {props.section.course.description}
            </p>
            <section className={Css.credits}>
                <h3>Credits</h3>
                <div>{computeCredits(props.section)} (HMC)</div>
            </section>
            <section className={Css.instructors}>
                <h3>
                    Instructor{props.section.instructors.length > 1 ? "s" : ""}
                </h3>
                <ul>
                    {props.section.instructors.map((i) => (
                        <li key={i.name}>{i.name}</li>
                    ))}
                </ul>
            </section>
            <section className={Css.areas}>
                <h3>Course Areas</h3>
                <ul>
                    {props.section.courseAreas.map((c) => (
                        <li key={c}>{descriptions.data.get(c) ?? c}</li>
                    ))}
                </ul>
            </section>
        </>
    );
}
