import { z } from "zod";
import type { CourseFiles } from "../course";
import { TermIdentifierString } from "hyperschedule-shared/api/v4";

/**
 * defines which param an endpoint use, if any
 */
export const Param = z.union([
    z.literal("catalog"),
    z.literal("session"),
    z.literal("year"),
]);
export type Param = z.infer<typeof Param>;

export const Params = z.object({
    catalog: z.string().regex(/UG\d{2}/),
    session: TermIdentifierString,
    year: z.string().regex(/^20\d{2}$/),
});
export type Params = z.infer<typeof Params>;

const Endpoint = z.object({
    link: z.string().url(),
    param: Param.nullable(),
    // number of seconds between fetch
    interval: z.number().positive(),
    saveAs: z.string(),
});
export type Endpoint = z.infer<typeof Endpoint>;
export type Endpoints = Record<
    keyof CourseFiles | "courseAreaDescription",
    Endpoint
>;
