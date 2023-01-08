import type { Section } from "hyperschedule-shared/api/v4";

export function matchesText(section: Section, text: string): boolean {
    const terms: string[] = [];
    for (const match of text.matchAll(/[A-Za-z]+|\d+/g))
        terms.push(match[0].toLocaleLowerCase());

    const items = [
        section.course.code.department,
        section.course.code.courseNumber.toString().padStart(3, "0"),
        section.course.code.affiliation,
        section.identifier.sectionNumber.toString().padStart(2, "0"),
        section.course.title,
    ];

    return terms.every((term) =>
        items.some((item) =>
            item.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
        ),
    );
}
