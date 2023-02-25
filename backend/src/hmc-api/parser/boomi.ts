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
          fields: string[];
          entryIndex: number;
      }
    | {
          tag: BoomiWarningTag.InsufficientEntryValues;
          fields_desired: number;
          fields_given: number;
          fields: string[];
          entryIndex: number;
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
 *  value of the `K` type.
 * @param data A string containing a Boomi database dump.
 * @returns If parsing was successful, a result containing the list of all valid
 *  database entries parsed into records according to the fields parameter,
 *  and a list of warnings. If unsuccessful, returns the fatal error.
 */
export function parseBoomi<K extends string>(
    fields: (K | null)[],
    data: string,
): BoomiResult<K> {
    type EntryRecord = Record<K, string>;

    const outStart = data.match(/OUT_START\|\d+\|\@\|/);
    if (outStart === null) {
        return { ok: false, error: BoomiError.MalformedHeader };
    }

    const records: EntryRecord[] = [];
    const warnings: BoomiWarning[] = [];

    const dataStartIndex = outStart.index! + outStart[0].length;
    const boomiEntries = data.slice(dataStartIndex).split("|#|");

    let hasSentinel = false;
    for (let entryIndex = 0; entryIndex < boomiEntries.length; ++entryIndex) {
        const boomiEntry = boomiEntries[entryIndex]!;

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
                fields: boomiEntryValues,
                entryIndex,
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
                fields: boomiEntryValues,
                entryIndex,
            });
        }
        const parsedRecord: { [k: string]: string } = {};
        for (let fieldIndex = 0; fieldIndex < fields.length; ++fieldIndex) {
            const field = fields[fieldIndex];
            if (field === null) {
                continue;
            }
            // Safety: 0 <= field_idx < fields.length <= boomi_entry_values.length.
            parsedRecord[field!] = boomiEntryValues[fieldIndex]!;
        }

        // Safety: By assumption, `fields` contains at least one of every possible
        // string variant in the `K` type. We have also checked that enough
        // columns are present so that every key has a corresponding value.
        records.push(parsedRecord as EntryRecord);
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
