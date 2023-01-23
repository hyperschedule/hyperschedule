import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { DBSection } from "./collections";

export function sectionToDb(s: APIv4.Section): DBSection {
    const { identifier, ...rest } = s;
    return { ...rest, _id: identifier };
}

export function dbToSection(s: DBSection): APIv4.Section {
    const { _id, ...rest } = s;
    return { ...rest, identifier: _id };
}
