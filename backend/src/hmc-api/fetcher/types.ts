import { z } from "zod";
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

export const HmcApiFiles = z.object({
    altstaff: z.string(),
    calendarSession: z.string(),
    calendarSessionSection: z.string(),
    courseRaw: z.string(),
    courseSection: z.string(),
    courseSectionSchedule: z.string(),
    permCount: z.string(),
    sectionInstructor: z.string(),
    staff: z.string(),
    courseAreas: z.string(),
    courseAreaDescription: z.string(),
});
export type HmcApiFiles = z.infer<typeof HmcApiFiles>;

export interface Endpoint {
    name: keyof HmcApiFiles;
    link: string;
    params: ParamOptions | null;
    interval: number;
    saveAs: string;
}

export type Endpoints = Record<keyof HmcApiFiles, Endpoint>;

export const IntString = z.string().regex(/^[0-9]+$/);
export const DecimalString = z.string().regex(/^[0-9]+\.[0-9]+$/);
