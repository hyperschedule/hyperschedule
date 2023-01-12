import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { DBSection } from "./models";
import * as console from "console";

export function sectionToDb(s: APIv4.Section): DBSection {
    const { identifier } = s;
    // eslint-disable-next-line
    delete (s as any).identifier;

    const res = { _id: identifier, ...s };
    s.identifier = identifier;
    return res;
}

export function dbToSection(s: DBSection): APIv4.Section {
    const { _id } = s;
    // eslint-disable-next-line
    delete (s as any)._id;
    const res = { identifier: _id, ...s };
    s._id = _id;
    return res;
}
