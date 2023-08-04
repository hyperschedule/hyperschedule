import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { DBSection } from "./collections";
import { v4 } from "uuid";

export function sectionToDb(s: APIv4.Section): DBSection {
    const { identifier, ...rest } = s;
    return { ...rest, _id: identifier };
}

export function dbToSection(s: DBSection): APIv4.Section {
    const { _id, ...rest } = s;
    return { ...rest, identifier: _id };
}

export function uuid4(prefix: string = ""): string {
    const arr: number[] = [];
    v4({}, arr);
    const encoded = Buffer.from(arr).toString("base64url");
    if (prefix)
        // the only characters allowed in a URL and is not in b64 encoding are ~ and .
        return `${prefix}.${encoded}`;
    return encoded;
}
