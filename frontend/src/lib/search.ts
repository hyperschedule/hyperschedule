import * as APIv4 from "hyperschedule-shared/api/v4";

export enum MatchCategory {
    // full course code match. e.g. csci131
    code = 1 << 7,
    title = 1 << 6,
    department = 1 << 5,
    number = 1 << 4,
    instructor = 1 << 3,
    description = 1 << 2,
    courseArea = 1 << 1,
    campus = 1 << 0,
}

export const exactMatchThreshold = 1 << 8;

type Match = {
    category: MatchCategory;
    isExactMatch: boolean;
};

// compute match score such that the lowest exact match is higher than the highest fuzzy match
function computeMatchScore(categories: Match[]): number | null {
    if (categories.length === 0) return null;
    return categories.reduce(
        (accumulator, value) =>
            accumulator + (value.category << (+value.isExactMatch * 8)),
        0,
    );
}

const tokensRegex = /[0-9]+|[a-z]+/g;

/*

  try all exact matches

  match each token,
  return true if every token matches true




  */

/**
 * the most generic text search. this function returns a positive integer indicating the priority (1 being lowest) or null indicating no match
 * this is necessary in the case of, e.g., a search term of "rust". in this case, we should rank courses from the
 * russian studies department (whose department code is RUST), followed by anything containing the phrase "rust" in the
 * title, followed by anything with the word rust in the description, and, lastly, anything taught by coach Rusty Berry.
 */
export function matchesText(
    text: string,
    section: APIv4.Section,
): number | null {
    if (text === "") return 1; // everything matches with the same score
    const matches: Match[] = [];

    const searchString = text.toLocaleLowerCase();
    const tokens = Array.from(searchString.matchAll(tokensRegex)).map(
        (v) => v[0],
    );

    const dept = section.identifier.department.toLowerCase();
    const suffix = section.identifier.suffix.toLowerCase();
    const affiliation = section.identifier.affiliation.toLowerCase();
    const title = section.course.title.toLocaleLowerCase();
    const instructors = section.instructors.map((i) =>
        i.name.toLocaleLowerCase(),
    );
    const description = section.course.description.toLocaleLowerCase();

    // --------- first priority: code ----------
    // exact match
    const code = APIv4.stringifySectionCode(section.identifier).toLowerCase();
    if (code.startsWith(tokens.join(" ")) || code.startsWith(searchString)) {
        matches.push({
            category: MatchCategory.code,
            isExactMatch: true,
        });
    }

    // fuzzy match
    else {
        const codeSegments = [
            dept,
            section.identifier.courseNumber.toString().padStart(3, "0"),
            suffix,
            affiliation,
            section.identifier.sectionNumber.toString().padStart(2, "0"),
        ].filter((s) => s);

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
        m: if (codeSegments.length >= tokens.length) {
            for (let i = 0; i < tokens.length; ++i) {
                if (!codeSegments[i]!.includes(tokens[i]!)) {
                    break m;
                }
            }
            matches.push({
                category: MatchCategory.code,
                isExactMatch: false,
            });
        }
    }

    // --------- second priority: title ------------

    if (title === searchString) {
        matches.push({
            category: MatchCategory.title,
            isExactMatch: true,
        });
    } else if (title.includes(searchString)) {
        matches.push({
            category: MatchCategory.title,
            isExactMatch: false,
        });
    } else {
        const titleFragments = title.split(" ");
        for (const t of tokens) {
            if (titleFragments.includes(t)) {
                matches.push({
                    category: MatchCategory.title,
                    isExactMatch: false,
                });
                break;
            }
        }
    }

    // --------- third priority: department ----------

    // exact match
    // we only match the first element because, e.g. if someone searches for intro to lit, we want that
    // class to show up first, instead of everything from the lit department.
    if (tokens[0] === dept) {
        matches.push({
            category: MatchCategory.department,
            isExactMatch: true,
        });
    }
    // fuzzy match
    else {
        for (const t of tokens) {
            if (dept.includes(t)) {
                matches.push({
                    category: MatchCategory.department,
                    isExactMatch: false,
                });
                break;
            }
        }
    }

    // --------- fourth priority: course number --------

    // if array is out of bound this will become NaN, which will be false
    if (
        parseInt(tokens[0]!, 10) === section.identifier.courseNumber ||
        parseInt(tokens[1]!, 10) === section.identifier.courseNumber
    ) {
        matches.push({
            category: MatchCategory.number,
            isExactMatch: true,
        });
    } else {
        for (const t of tokens) {
            if (section.identifier.courseNumber.toString(10).includes(t)) {
                matches.push({
                    category: MatchCategory.number,
                    isExactMatch: false,
                });
                break;
            }
        }
    }

    // --------- fifth priority: instructor --------

    if (instructors.includes(searchString)) {
        matches.push({
            category: MatchCategory.instructor,
            isExactMatch: true,
        });
    } else {
        for (const instructor of instructors) {
            if (instructor.includes(searchString)) {
                matches.push({
                    category: MatchCategory.instructor,
                    isExactMatch: false,
                });
            }
        }
    }

    // --------- sixth priority: description --------

    /// can this even happen?
    if (description === searchString) {
        matches.push({
            category: MatchCategory.description,
            isExactMatch: true,
        });
    } else {
        for (const t of tokens) {
            if (description.includes(t)) {
                matches.push({
                    category: MatchCategory.description,
                    isExactMatch: false,
                });
            }
        }
    }

    // --------- seventh priority: course areas --------
    // #TODO

    return computeMatchScore(matches);
}

export const enum FilterKey {
    Department = "dept",
    Title = "title",
    Campus = "campus",
    Description = "desc",
    CourseCode = "code",
    Instructor = "inst",
    ScheduleDays = "days",
    CourseArea = "area",
    MeetingTime = "time",
}

export type FilterData = {
    [FilterKey.Department]: {
        text: string;
    };
    [FilterKey.Instructor]: {
        text: string;
    };
    [FilterKey.Description]: {
        text: string;
    };
    [FilterKey.CourseCode]: {
        text: string;
    };
    [FilterKey.Title]: {
        text: string;
    };
    [FilterKey.ScheduleDays]: {
        days: Set<APIv4.Weekday>;
    };
    [FilterKey.MeetingTime]: {
        startTime: number;
        endTime: number;
    };
    [FilterKey.CourseArea]: {
        area: string;
    };
    [FilterKey.Campus]: {
        campus: APIv4.School;
    };
};

export type Filter = {
    [K in FilterKey]: {
        key: K;
        data: FilterData[K];
    };
}[FilterKey];

export type Filters = Record<FilterKey, Filter>;

export const exampleFilters: Partial<Filters> = {
    [FilterKey.CourseArea]: {
        key: FilterKey.CourseArea,
        data: { area: "5WRT" },
    },
    [FilterKey.MeetingTime]: {
        key: FilterKey.MeetingTime,
        data: { startTime: 0, endTime: 17 * 60 + 30 },
    },
    [FilterKey.Title]: { key: FilterKey.Title, data: { text: "" } },
};
// { key: FilterKey.Campus, data: { campus: APIv4.School.HMC } },

//
// export function matchesFilter(section: Section, filter: Filter): boolean {
//     switch (filter.key) {
//         case FilterKey.Department:
//             return false;
//
//         default:
//             return false;
//     }
// }
//
// export function matchesText(section: Section, text: string): boolean {
//     const terms: string[] = [];
//     for (const match of text.matchAll(/[A-Za-z]+|\d+/g))
//         terms.push(match[0].toLocaleLowerCase());
//
//     const items = [
//         section.course.code.department,
//         section.course.code.courseNumber.toString().padStart(3, "0"),
//         section.course.code.affiliation,
//         section.identifier.sectionNumber.toString().padStart(2, "0"),
//         section.course.title,
//     ];
//
//     return terms.every((term) =>
//         items.some((item) =>
//             item.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
//         ),
//     );
// }
//
// export function matches(
//     section: Section,
//     text: string,
//     filters: Filter[],
// ): boolean {
//     return (
//         matchesText(section, text) &&
//         filters.every((filter) => matchesFilter(section, filter))
//     );
// }
