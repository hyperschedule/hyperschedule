// BSSV parser: BullShit-Separated Values file. it's like CSVs, but instead of
// commas you have ||`||. every cell should be surrounded in double-quotes
// (which are deleted when parsing); if not, the cell is parsed as-is (and a
// `MalformedCell` warning is emitted). rows are still delimited by newlines.

// within every cell:
// - contents should not contain any occurrences of ||`|| or newlines.
// - to encode/escape newlines, use ||``||

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

function parseCell(cell: string): { parsed: string; malformed: boolean } {
    const malformed = !(cell.startsWith('"') && cell.endsWith('"'));
    const trimmed = malformed ? cell : cell.slice(1, cell.length - 1);
    return { malformed, parsed: trimmed.replaceAll("||``||", "\n") };
}

export function parseBssv<Spec extends Record<string, string>>(
    specification: Spec,
    data: string,
): Result<Spec> {
    const records: Record<keyof Spec, string>[] = [];
    const warnings: Warning[] = [];

    const lines = data.trim().split("\n");

    // construct header-to-columnindex mapping
    const headerCells = lines[0]!.split("||`||");
    const headerIndex = new Map<string, number>();
    for (let j = 0; j < headerCells.length; ++j) {
        const result = parseCell(headerCells[j]!);
        if (result.malformed)
            warnings.push({ tag: WarningTag.MalformedCell, row: 0, column: j });
        headerIndex.set(result.parsed, j);
    }

    // check that all columns exist in the header
    const missingColumns: string[] = [];
    let maxIndex = -1;
    for (const columnName of Object.values(specification)) {
        if (!headerIndex.has(columnName)) missingColumns.push(columnName);
        maxIndex = Math.max(maxIndex, headerIndex.get(columnName)!);
    }
    if (missingColumns.length > 0) return { ok: false, missingColumns };

    // parse each row
    for (let i = 1; i < lines.length; ++i) {
        const row: string[] = [];

        const cells = lines[i]!.split("||`||");
        for (let j = 0; j < cells.length; ++j) {
            const result = parseCell(cells[j]!);
            if (result.malformed)
                warnings.push({
                    tag: WarningTag.MalformedCell,
                    row: i,
                    column: j,
                });
            row.push(result.parsed);
        }

        if (row.length !== headerCells.length)
            warnings.push({
                tag: WarningTag.InconsistentRowLength,
                row: i,
                length: row.length,
            });

        // be forgiving: even if the row length might be wrong, only delete the
        // row if it doesn't have enough columns to cover all the _needed_
        // ones
        if (row.length <= maxIndex) continue;

        const record = Object.fromEntries(
            Object.entries(specification).map(([key, columnName]) => [
                key,
                row[headerIndex.get(columnName)!]!,
            ]),
        );

        // BEGIN UNSAFE: manually check dynamically-generated record has the right type
        records.push(record as any);
        // END UNSAFE
    }

    return { ok: true, warnings, records };
}
