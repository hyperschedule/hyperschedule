import type * as APIv4 from "hyperschedule-shared/api/v4";

const tokensRegex = /[0-9]+|[a-z]+/g;

/**
 * the most generic text search. this function returns a positive integer indicating the match score, with null being
 * no match. any token that did not at least match something will result in a no match. in general, the more character
 * we add to the search string, the fewer things it should match.
 */
export function matchesText(
    text: string,
    section: APIv4.Section,
    courseAreaMap?: Map<string, string>,
): number | null {
    if (text === "") return 1; // everything matches with the same score

    const searchString = text.toLocaleLowerCase();
    const tokens = Array.from(searchString.matchAll(tokensRegex)).map(
        (v) => v[0],
    );

    const dept = section.identifier.department.toLowerCase();
    const courseNumberString = section.identifier.courseNumber
        .toString()
        .padStart(3, "0");
    const sectionNumberString = section.identifier.sectionNumber
        .toString()
        .padStart(2, "0");
    const suffix = section.identifier.suffix.toLowerCase();
    const affiliation = section.identifier.affiliation.toLowerCase();
    const title = section.course.title.toLocaleLowerCase();
    const titleFragment = title.split(" ");
    const instructors = section.instructors.map((i) =>
        i.name.toLocaleLowerCase(),
    );
    const locations = section.schedules.flatMap((s) =>
        s.locations.map((l) => l.toLocaleLowerCase()),
    );
    const description = section.course.description.toLocaleLowerCase();
    const areas: (string | undefined)[] =
        courseAreaMap === undefined
            ? []
            : section.courseAreas.map(
                  (area) => courseAreaMap.get(area)?.toLocaleLowerCase(),
              );

    let scoreAccumulator = 1;
    let searchStringMatch = false;
    if (description.includes(searchString)) {
        // we don't want to do tokenized matches because it turns up a lot of weird results. for example
        // "cs" might match the end of the word "topics"
        scoreAccumulator *= 1 + searchString.length / description.length;
        searchStringMatch = true;
    }

    for (const location of locations) {
        if (location.includes(searchString)) {
            // tokenized matches for location will match room numbers, which is not what we wanted
            scoreAccumulator = 1 + searchString.length / location.length;
            searchStringMatch = true;
            break;
        }
    }

    for (const token of tokens) {
        const scores: number[] = [];
        const tokenNumerical: number | null = Number.isNaN(
            Number.parseInt(token, 10),
        )
            ? null
            : Number.parseInt(token, 10);

        // --------- department ----------
        if (dept.includes(token)) {
            scores.push(token.length / dept.length);
        }

        // --------- course number ----------
        if (tokenNumerical === section.identifier.courseNumber) {
            scores.push(1);
        } else if (courseNumberString.includes(token)) {
            scores.push(token.length / 3); // 3 is the length of courseNumberString
        }

        // --------- suffix ----------
        if (suffix.includes(token)) {
            scores.push(token.length / suffix.length);
        }

        // --------- section number ----------
        if (tokenNumerical === section.identifier.sectionNumber) {
            scores.push(1);
        } else if (sectionNumberString.includes(token)) {
            scores.push(token.length / 2); // 2 is the length of sectionNumberString
        }

        // --------- affiliation --------------
        if (affiliation.includes(token)) {
            scores.push(token.length / affiliation.length);
        }

        // --------- title ----------------
        for (const frag of titleFragment) {
            if (frag.includes(token)) {
                scores.push(token.length / frag.length);
                break;
            }
        }

        // --------- instructor --------------
        instOuter: for (const instructor of instructors) {
            const nameFragment = instructor.split(" ");
            for (const frag of nameFragment) {
                if (frag.includes(token)) {
                    scores.push(token.length / frag.length);
                    break instOuter;
                }
            }
        }

        // --------- course areas --------------

        areaOuter: for (const area of areas) {
            if (area === undefined) continue;
            const areaFragment = area.split(" ");
            for (const frag of areaFragment) {
                if (frag.includes(token)) {
                    scores.push(token.length / frag.length);
                    break areaOuter;
                }
            }
        }

        if (scores.length === 0 && !searchStringMatch) return null;
        scoreAccumulator *= 1 + scores.reduce((a, b) => a + b, 0);
    }

    return scoreAccumulator;
}

export enum FilterKey {
    Department = "dept",
    Title = "title",
    Campus = "campus",
    Description = "desc",
    CourseCode = "code",
    Instructor = "instr",
    ScheduleDays = "days",
    CourseArea = "area",
    MeetingTime = "time",
}

export const filterKeyRegexp = RegExp(
    `\\b(${Object.values(FilterKey).join("|")})$`,
    "i",
);

export type TextFilter = { text: string };
export type DaysFilter = { days: Set<APIv4.Weekday> };
export type TimeFilter = {
    startTime: number | null;
    endTime: number | null;
};
export type CampusFilter = {
    campus: APIv4.School;
};
export type CourseAreaFilter = {
    area: string;
};

export type FilterData = {
    [FilterKey.Department]: TextFilter;
    [FilterKey.Instructor]: TextFilter;
    [FilterKey.Description]: TextFilter;
    [FilterKey.CourseCode]: TextFilter;
    [FilterKey.Title]: TextFilter;
    [FilterKey.ScheduleDays]: DaysFilter;
    [FilterKey.MeetingTime]: TimeFilter;
    [FilterKey.CourseArea]: CourseAreaFilter;
    [FilterKey.Campus]: CampusFilter;
};

export type Filter = {
    [K in FilterKey]: {
        key: K;
        data: FilterData[K] | null;
    };
}[FilterKey];

export function filterSection(
    section: APIv4.Section,
    filters: Filter[],
): boolean {
    // a section is a match iff all filters match
    for (const filter of filters) {
        if (!filter.data) continue;
        switch (filter.key) {
            case FilterKey.Department:
                if (
                    !section.identifier.department
                        .toLowerCase()
                        .includes(filter.data.text)
                )
                    return false;
                break;
            case FilterKey.Campus:
                if (section.course.primaryAssociation !== filter.data.campus)
                    return false;
                break;
            case FilterKey.Description:
                if (
                    !section.course.description
                        .toLowerCase()
                        .includes(filter.data.text)
                )
                    return false;
                break;
            case FilterKey.CourseCode:
                const tokens = Array.from(
                    filter.data.text.matchAll(tokensRegex),
                ).map((v) => v[0]);
                if (tokens.length > 3) return false;
                switch (tokens.length) {
                    case 3:
                        if (!section.identifier.suffix.includes(tokens[2]!))
                            return false;
                    case 2:
                        if (
                            !section.identifier.courseNumber
                                .toString()
                                .padStart(3, "0")
                                .includes(tokens[1]!)
                        )
                            return false;
                    case 1:
                        if (
                            !section.identifier.department
                                .toLowerCase()
                                .includes(tokens[0]!)
                        )
                            return false;
                }
                break;
            case FilterKey.Instructor:
                const data = filter.data;
                if (
                    !section.instructors.some((instr) =>
                        instr.name.toLowerCase().includes(data.text),
                    )
                )
                    return false;
                break;
            case FilterKey.ScheduleDays:
                break;
            case FilterKey.CourseArea:
                if (!section.courseAreas.includes(filter.data.area!))
                    return false;
                break;
            case FilterKey.MeetingTime:
                for (const schedule of section.schedules) {
                    if (
                        filter.data.startTime &&
                        schedule.startTime < filter.data.startTime
                    )
                        return false;
                    if (
                        filter.data.endTime &&
                        schedule.endTime > filter.data.endTime
                    )
                        return false;
                }
                break;
            case FilterKey.Title:
                if (
                    !section.course.title
                        .toLocaleLowerCase()
                        .includes(filter.data.text.toLocaleLowerCase())
                )
                    return false;
                break;
        }
    }
    return true;
}

export const enum CompOperator {
    GreaterThan = ">",
    LessThan = "<",
    AtLeast = ">=", // nobody wants to type GreaterThanOrEqualsTo
    AtMost = "<=",
    Equal = "=",
}

/**
 * this is a mini-AST of range expression, which will be applied to time and credits.
 * single type would be something like, >=3, <2:00pm and range would be 1-3, 2:00pm-5:00pm
 */
type RangeFilterExp<T> =
    | {
          type: "single";
          op: CompOperator;
          value: T;
      }
    | {
          type: "range";
          start: T;
          end: T;
      };

// beware the <= and >= has to appear before > and < in this regex
const compOpRegex = /^(<=|>=|>|<|=)(.*)$/;
const rangeRegex = /^(.*)-(.*)$/;

export function parseRangeExp<T>(
    input: string,
    parseExp: (value: string) => T | null,
): RangeFilterExp<T> | null {
    const compMatch = input.match(compOpRegex);
    if (compMatch !== null) {
        const op = compMatch[1] as CompOperator;
        const value = parseExp(compMatch[2]!.trim());
        if (value === null) return null;
        return {
            type: "single",
            op,
            value: value,
        };
    }

    const rangeMatch = input.match(rangeRegex);
    if (rangeMatch !== null) {
        const left = rangeMatch[1]!.trim();
        const right = rangeMatch[2]!.trim();

        const start = parseExp(left);
        if (start === null) return null;

        const end = parseExp(right);
        if (end === null) return null;

        return {
            type: "range",
            start,
            end,
        };
    }
    return null;
}

export function editDistance(
    start: string,
    end: string,
    cost?: Partial<{ insert: number; delete: number; replace: number }>,
): number {
    const insertCost = cost?.insert ?? 1;
    const deleteCost = cost?.delete ?? 1;
    const replaceCost = cost?.replace ?? 1;

    const table: number[] = [];
    const index = (i: number, j: number) => i * (end.length + 1) + j;

    for (let i = 0; i <= start.length; ++i) table[index(i, 0)] = i * deleteCost;
    for (let j = 0; j <= end.length; ++j) table[index(0, j)] = j * insertCost;

    for (let i = 1; i <= start.length; ++i)
        for (let j = 1; j <= end.length; ++j) {
            table[index(i, j)] = Math.min(
                deleteCost + table[index(i - 1, j)]!,
                replaceCost * +(start[i - 1]! !== end[j - 1]!) +
                    table[index(i - 1, j - 1)]!,
                insertCost + table[index(i, j - 1)]!,
            );
        }

    return table[index(start.length, end.length)]!;
}
