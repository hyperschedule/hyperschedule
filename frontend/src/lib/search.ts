import type { Section } from "hyperschedule-shared/api/v4";

export const enum FilterKey {
    Department=0,
    Title=1,
    Description=2,
    CourseCode=3,
    Instructor=4,
    ScheduleDays=5,
}

export type Filter =
    | {
          key:
              | FilterKey.Department
              | FilterKey.Instructor
              | FilterKey.Description
              | FilterKey.CourseCode
              | FilterKey.Title;
          contains: string;
      }
    | {
          key: FilterKey.ScheduleDays;
          days: Set<never>; // TODO
      };

export interface Search {
    text: string;
    filters: Filter[];
}

export function matchesFilter(section: Section, filter: Filter): boolean {
    switch (filter.key) {
        case FilterKey.Department:
            return false;

        default:
            return false;
    }
}

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

export function matches(section: Section, search: Search): boolean {
    return (
        matchesText(section, search.text) &&
        search.filters.every((filter) => matchesFilter(section, filter))
    );
}
