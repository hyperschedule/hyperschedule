import * as APIv4 from "hyperschedule-shared/api/v4";

export async function getAllTerms() {
    const resp = await fetch(`${__API_URL__}/v4/term/all`);
    return APIv4.TermIdentifier.array().parse(await resp.json());
}

export async function getSectionsForTerm(term: APIv4.TermIdentifier) {
    const resp = await fetch(
        `${__API_URL__}/v4/sections/${APIv4.stringifyTermIdentifier(term)}`,
    );
    const sections = APIv4.Section.array().parse(await resp.json());
    // we want the areas for schools to appear last, which is sorted numerically
    sections.forEach((s) => s.courseAreas.reverse());
    return sections;
}

export async function getCourseAreaDescription() {
    const resp = await fetch(`${__API_URL__}/v4/course-areas`);
    return new Map<string, string>(
        (await resp.json()).map((a: { area: string; description: string }) => [
            a.area,
            a.description,
        ]),
    );
}

export async function getOfferingHistory(term: APIv4.TermIdentifier) {
    const resp = await fetch(
        `${__API_URL__}/v4/offering-history/${APIv4.stringifyTermIdentifier(
            term,
        )}`,
    );
    return APIv4.OfferingHistory.array().parse(await resp.json());
}
