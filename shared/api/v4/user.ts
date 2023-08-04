import { SectionIdentifier, TermIdentifier } from "./course";
import { z } from "zod";
import * as APIv4 from "./course-code";

export const UserSection = z.object({
    // placeholder attribute for future implementation of folders
    section: SectionIdentifier,
    attrs: z.object({
        selected: z.boolean(),
    }),
});
export type UserSection = z.infer<typeof UserSection>;

export const UserSchedule = z.object({
    _id: z.string().uuid(),
    isActive: z.boolean(),
    term: TermIdentifier,
    name: z.string(),
    sections: UserSection.array(),
});
export type UserSchedule = z.infer<typeof UserSchedule>;

export const GuestUser = z.object({
    _id: z.string().uuid(),
    schedules: UserSchedule.array().max(100),
    isGuest: z.literal(true),
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: z.number().positive(),
});
export type GuestUser = z.infer<typeof GuestUser>;

export const RegisteredUser = z.object({
    _id: z.string().uuid(),
    schedules: UserSchedule.array().max(100),
    isGuest: z.literal(false),
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: z.number().positive(),
    // eduPersonPrincipalName, most likely the user's email
    eppn: z.string(),
});
export type RegisteredUser = z.infer<typeof RegisteredUser>;

export const User = z.discriminatedUnion("isGuest", [
    RegisteredUser,
    GuestUser,
]);
export type User = z.infer<typeof User>;

export const AddScheduleRequest = z.object({
    term: TermIdentifier,
    name: z.string(),
});
export type AddScheduleRequest = z.infer<typeof AddScheduleRequest>;

export const AddScheduleResponse = z.object({
    scheduleId: z.string(),
});
export type AddScheduleResponse = z.infer<typeof AddScheduleResponse>;

export const DeleteScheduleRequest = AddScheduleResponse;
export type DeleteScheduleRequest = AddScheduleResponse;

export const AddSectionRequest = z.object({
    scheduleId: z.string(),
    section: SectionIdentifier,
});
export type AddSectionRequest = z.infer<typeof AddSectionRequest>;

export const DeleteSectionRequest = AddSectionRequest;
export type DeleteSectionResponse = AddSectionRequest;
