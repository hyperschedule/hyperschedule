import { z } from "zod";

const timeRegex = /\d{2}:\d{2}/;
const dateRegex = /\d{4}-\d{2}-\d{2}/;

export const Schedule = z.object({
    scheduleDays: z.string().regex(/[MTWRFSU]*/),
    scheduleStartTime: z.string().regex(timeRegex),
    scheduleEndTime: z.string().regex(timeRegex),
    scheduleStartDate: z.string().regex(dateRegex),
    scheduleEndDate: z.string().regex(dateRegex),
    scheduleTermCount: z.number().int().positive(),
    scheduleTerms: z.number().int().nonnegative().array(),
    scheduleLocation: z.string(),
});
export type Schedule = z.infer<typeof Schedule>;

export enum EnrollmentStatus {
    open = "open",
    closed = "closed",
    reopened = "reopened",
    unknown = "unknown",
}
export const EnrollmentStatusEnum = z.nativeEnum(EnrollmentStatus);
export type EnrollmentStatusEnum = z.infer<typeof EnrollmentStatusEnum>;

export const Course = z.object({
    courseCode: z.string(),
    courseName: z.string(),
    courseSortKey: z.string().array(),
    courseMutualExclusionKey: z.string().array(),
    courseDescription: z.string(),
    courseInstructors: z.string().array(),
    courseTerm: z.string(),
    courseSchedule: Schedule.array(),
    courseCredits: z.number().nonnegative(),
    courseSeatsTotal: z.number().int().nonnegative(),
    courseSeatsFilled: z.number().int().nonnegative(),
    courseWaitlistLength: z.null(),
    courseEnrollmentStatus: EnrollmentStatusEnum,
    permCount: z.number().int().nonnegative(),
});
export type Course = z.infer<typeof Course>;
