export const enum WarningTag {
    MalformedCell = "MalformedCell",
    InconsistentRowLength = "InconsistentRowLength",
}

export type Warning =
    | { tag: WarningTag.MalformedCell; row: number; column: number }
    | { tag: WarningTag.InconsistentRowLength; row: number; length: number };

export type Result<Spec> =
    | { ok: true; records: Record<keyof Spec, string>[]; warnings: Warning[] }
    | { ok: false; missingColumns: string[] };
