/**
 * This module is the parser for json object we receive. The simple way to use it is to specify input, a zod validator
 * for output, and a transform object with functions for each key. parseJSON is the array equivalent of parseJSONItem.
 * For example:
 * ```ts
 *  parseJSONItem(
 *             {a: 1, b: 2}, // input
 *             z.object({a: z.number(), b: z.string()}).strict(), // validator
 *             { // transform object
 *                 a: NoTransform,
 *                 b(v: number) {
 *                     return {
 *                         name: "b",
 *                         value: v.toString(),
 *                     };
 *                 },
 *             },
 *         )
 * ```
 *
 */

import { createLogger } from "../../logger";
import type { z } from "zod";

const logger = createLogger("hmc.parser.json");

export interface TransformResult<Output, Key extends keyof Output> {
    name: Key;
    value: Output[Key];
}

export type TransformFunction<
    Input,
    InKey extends keyof Input,
    Output,
    OutKey extends keyof Output,
> = (v: Input[InKey]) => TransformResult<Output, OutKey>;

export const NoTransform = Symbol();
export type NoTransform = typeof NoTransform;

export const Remove = Symbol();
export type Remove = typeof Remove;

export type JSONTransform<Input, Output> = Record<
    keyof Input,
    | TransformFunction<Input, keyof Input, Output, keyof Output>
    | NoTransform
    | Remove
>;
type Data = Record<string, unknown>;

/**
 * Parses a single json item result with transform.
 * @param data the input data. this data should be valid and already sanitized with zod
 * @param outValidator the zod object for the output
 * @param transform an mapping of key to transform functions to transform and rename the data
 */
export function parseJSONItem<
    Input extends Data,
    Output extends Data,
    ZodShape extends z.ZodRawShape,
>(
    data: Input,
    outValidator: z.ZodType<Output, z.ZodObjectDef<ZodShape, "strict">>,
    transform: JSONTransform<Input, Output>,
): z.SafeParseReturnType<Output, Output> {
    const result: Partial<Output> = {};
    for (const inKey of Object.keys(transform) as (keyof Input)[]) {
        const transformFunc = transform[inKey];
        if (transformFunc === NoTransform) {
            // this is fine because we also sanitize the data with zod before returning it
            (result as any)[inKey] = data[inKey];
        } else if (transformFunc === Remove) {
            // do nothing
        } else {
            const { name, value } = transformFunc(data[inKey]);
            result[name] = value;
        }
    }

    return outValidator.safeParse(result);
}

export function parseJSON<
    Input extends Data,
    Output extends Data,
    ZodShape extends z.ZodRawShape,
>(
    data: Input[],
    outValidator: z.ZodType<Output, z.ZodObjectDef<ZodShape, "strict">>,
    transform: JSONTransform<Input, Output>,
): Output[] {
    const result: Output[] = [];
    for (const obj of data) {
        const parsed = parseJSONItem(obj, outValidator, transform);
        if (parsed.success) result.push(parsed.data);
        else logger.warn("Cannot parse object %O", obj);
    }
    return result;
}
