import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { DBSection } from "./models";

export function sectionToDb(s: APIv4.Section): DBSection {
    const { identifier } = s;
    return { _id: identifier, ...s };
}

export function dbToSection(s: DBSection): APIv4.Section {
    const { _id } = s;
    return { identifier: _id, ...s };
}
