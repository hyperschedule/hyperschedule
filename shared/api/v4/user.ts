import { SectionIdentifier, TermIdentifierString } from "./course";
import { z } from "zod";

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
    term: TermIdentifierString,
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
