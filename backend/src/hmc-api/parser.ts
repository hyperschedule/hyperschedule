// Currently, we have two different formats with different separators, one is
// rather standard csv files that may or may not have column headers. The other is
// something we call bssv: BullShit-Separated Values file. it's like CSVs, but instead of
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
    return { malformed, parsed: trimmed };
}

/**
 * Parse course data with given specification
 *
 * @param specification: an object with fields, hasHeader, separator
 * hasHeader: whether the file comes with a header column
 * separator, the separator value of the data, such as comma or ||`||
 * fields: a map between the header value and the returned variable name. If there
 * is no header, then the fields object will be used using the order passed in
 * @param data: the data file as a string
 */
export function parse<Fields extends Record<string, string>>(
    specification: { fields: Fields; hasHeader: boolean; separator: string },
    data: string,
): Result<Fields> {
    const { fields, hasHeader, separator } = specification;

    const records: Record<keyof Fields, string>[] = [];
    const warnings: Warning[] = [];

    const lines = data.trim().split("\n");

    let headerCells: string[];
    let headerIndex: Map<string, number> = new Map();
    let maxIndex: number;

    if (hasHeader) {
        // construct header-to-columnindex mapping
        headerCells = lines[0]!.split(separator);
        for (let j = 0; j < headerCells.length; ++j) {
            const result = parseCell(headerCells[j]!);
            if (result.malformed)
                warnings.push({
                    tag: WarningTag.MalformedCell,
                    row: 0,
                    column: j,
                });
            headerIndex.set(result.parsed, j);
        }

        // check that all columns exist in the header
        const missingColumns: string[] = [];
        maxIndex = -1;
        for (const columnName of Object.values(fields)) {
            if (!headerIndex.has(columnName)) missingColumns.push(columnName);
            maxIndex = Math.max(maxIndex, headerIndex.get(columnName)!);
        }
        if (missingColumns.length > 0) return { ok: false, missingColumns };
    } else {
        // we assume that the columns follow the order of the format in the spec
        // since ES2020, Object.keys are guaranteed to follow the order from when
        // the object was defined
        headerCells = [...Object.keys(fields)];
        maxIndex = headerCells.length;
        headerIndex = new Map(headerCells.map((v, i) => [v, i]));
    }

    // parse each row
    for (let i = 1; i < lines.length; ++i) {
        const row: string[] = [];

        const cells = lines[i]!.split(separator);
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
            Object.entries(fields).map(([key, columnName]) => [
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

export const enum BoomiWarningTag {
    ExtraneousEntryValues = "ExtraneousEntryValues",
    InsufficientEntryValues = "InsufficientEntryValues",
    MissingSentinel = "MissingSentinel",
}

export type BoomiWarning =
    | {
          tag: BoomiWarningTag.ExtraneousEntryValues;
          fields_desired: number;
          fields_given: number;
      }
    | {
          tag: BoomiWarningTag.InsufficientEntryValues;
          fields_desired: number;
          fields_given: number;
      }
    | {
          tag: BoomiWarningTag.MissingSentinel;
      };

export const enum BoomiError {
    MalformedHeader = "MalformedHeader",
}

export type BoomiResult<K extends string> =
    | {
          ok: true;
          records: Record<K, string>[];
          warnings: BoomiWarning[];
      }
    | {
          ok: false;
          error: BoomiError;
      };

/**
 *
 * @param fields A list containing the name of each field that the columns in the
 *  database correspond to. A null value means that the column at that index should be skipped.
 *  SAFETY: This list must contain at least one of every possible
 *  non-null value of the type  Fields[number].
 * @param data A string containing a Boomi database dump.
 * @returns If parsing was successful, a result containing the list of all valid
 *  database entries parsed into records according to the fields parameter,
 *  and a list of warnings. If unsuccessful, returns the fatal error.
 */
export function parseBoomi<K extends string, Fields extends (K | null)[]>(
    fields: Fields,
    data: string,
): BoomiResult<NonNullable<Fields[number]>> {
    type EntryRecord = Record<NonNullable<Fields[number]>, string>;

    const outStart = data.match(/OUT_START\|\d+\|\@\|/);
    if (outStart === null) {
        return { ok: false, error: BoomiError.MalformedHeader };
    }

    const records: EntryRecord[] = [];
    const warnings: BoomiWarning[] = [];

    const dataStartIndex = outStart.index! + outStart[0].length;
    const boomiEntries = data.slice(dataStartIndex).split("|#|");

    let hasSentinel = false;
    for (const boomiEntry of boomiEntries) {
        // Empty entry is used as sentinel.
        if (boomiEntry.length === 0) {
            hasSentinel = true;
            break;
        }
        const boomiEntryValues = boomiEntry.split("|^|");
        // Check that there are enough columns to occupy each field.
        // If not, skip this entry and go to the next one.
        if (boomiEntryValues.length < fields.length) {
            warnings.push({
                tag: BoomiWarningTag.InsufficientEntryValues,
                fields_desired: fields.length,
                fields_given: boomiEntryValues.length,
            });
            continue;
        }
        // Check if there are extraneous columns we must ignore.
        // If so, process only this entry's relevant values with a warning.
        if (boomiEntryValues.length > fields.length) {
            warnings.push({
                tag: BoomiWarningTag.ExtraneousEntryValues,
                fields_desired: fields.length,
                fields_given: boomiEntryValues.length,
            });
        }
        const recordKV: { [k: string]: string } = {};
        let fieldIdx = 0;
        for (const field of fields) {
            if (field === null) {
                ++fieldIdx;
                continue;
            }
            // Safety: 0 <= field_idx < fields.length <= boomi_entry_values.length.
            recordKV[field] = boomiEntryValues[fieldIdx]!;
            ++fieldIdx;
        }

        // Safety: By assumption, `fields` contains at least one of every possible
        // element string in the `Fields` type. We have also checked that enough
        // columns are present so that every key has a corresponding value.
        records.push(recordKV as EntryRecord);
    }

    if (!hasSentinel) {
        warnings.push({
            tag: BoomiWarningTag.MissingSentinel,
        });
    }

    return {
        ok: true,
        records,
        warnings,
    };
}
