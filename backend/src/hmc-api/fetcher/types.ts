import { z } from "zod";
import type { CourseFiles } from "../course";
import { TermEnum } from "hyperschedule-shared/api/v4";

/**
 * defines which param an endpoint use, if any
 */
export const ParamOptions = z.object({
    catalog: z.boolean(),
    session: z.boolean(),
    year: z.boolean(),
});
export type ParamOptions = z.infer<typeof ParamOptions>;

export const Params = z.object({
    catalog: z.string().regex(/UG\d{2}/),
    session: TermEnum,
    year: z.string().regex(/^20\d{2}$/),
});
export type Params = z.infer<typeof Params>;

const Endpoint = z.object({
    link: z.string().url(),
    params: ParamOptions.nullable(),
    // number of seconds between fetch
    interval: z.number().positive(),
    saveAs: z.string(),
});
export type Endpoint = z.infer<typeof Endpoint>;
export type Endpoints = Record<
    keyof CourseFiles | "courseAreaDescription",
    Endpoint
>;
