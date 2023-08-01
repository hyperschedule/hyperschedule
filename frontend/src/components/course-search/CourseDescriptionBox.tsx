import type * as APIv4 from "hyperschedule-shared/api/v4";

export default function CourseDescriptionBox(props: {
    section: APIv4.Section;
}) {
    return (
        <>
            <p>{props.section.credits} credits</p>
            {props.section.instructors.map((i) => (
                <p>{i.name}</p>
            ))}
            {props.section.course.description}
            Course Areas:
            {props.section.courseAreas}
        </>
    );
}
