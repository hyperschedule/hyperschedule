import {
    SchoolEnum,
    SectionIdentifier,
    TermIdentifier,
    termIsBefore,
} from "./course";
import { z } from "zod";

export const UserId = z.string().regex(/u~[A-Za-z0-9\-_]{22}/);
export const ScheduleId = z.string().regex(/s~[A-Za-z0-9\-_]{22}/);
export type UserId = z.infer<typeof UserId>;
export type ScheduleId = z.infer<typeof ScheduleId>;

export const UserSectionAttrs = z.object({
    selected: z.boolean(),
});
export type UserSectionAttrs = z.infer<typeof UserSectionAttrs>;

export const UserSection = z.object({
    section: SectionIdentifier,
    attrs: UserSectionAttrs,
});
export type UserSection = z.infer<typeof UserSection>;

export const UserSchedule = z.object({
    term: TermIdentifier,
    name: z.string(),
    sections: UserSection.array(),
});
export type UserSchedule = z.infer<typeof UserSchedule>;

export const LocalUser = z.object({
    _id: z.undefined(),
    schedules: z.record(ScheduleId, UserSchedule),
});
export type LocalUser = z.infer<typeof LocalUser>;

export const ServerUser = z.object({
    _id: UserId,
    eppn: z.string(),
    school: SchoolEnum,
    schedules: z.record(ScheduleId, UserSchedule),
});
export type ServerUser = z.infer<typeof ServerUser>;

export const User = z.union([LocalUser, ServerUser]);
export type User = z.infer<typeof User>;

/**
 * sort schedules in reverse chronological order, then by name in lexical order
 */
export function getSchedulesSorted(
    schedules: Record<ScheduleId, UserSchedule>,
): [ScheduleId, UserSchedule][] {
    const arr = Object.entries(schedules);
    arr.sort((a, b): number => {
        const schedule0 = a[1];
        const schedule1 = b[1];
        if (
            schedule0.term.year === schedule1.term.year &&
            schedule0.term.term === schedule1.term.term
        )
            return schedule0.name.localeCompare(schedule1.name);
        if (termIsBefore(schedule0.term, schedule1.term)) return 1;
        return -1;
    });
    return arr;
}

export const AddScheduleRequest = z.object({
    term: TermIdentifier,
    name: z.string(),
});
export type AddScheduleRequest = z.infer<typeof AddScheduleRequest>;
export const RenameScheduleRequest = z.object({
    scheduleId: z.string(),
    name: z.string(),
});
export type RenameScheduleRequest = z.infer<typeof RenameScheduleRequest>;

export const AddScheduleResponse = z.object({
    scheduleId: ScheduleId,
});
export type AddScheduleResponse = z.infer<typeof AddScheduleResponse>;

export const DeleteScheduleRequest = AddScheduleResponse;
export type DeleteScheduleRequest = AddScheduleResponse;

export const AddSectionRequest = z.object({
    scheduleId: ScheduleId,
    section: SectionIdentifier,
});
export type AddSectionRequest = z.infer<typeof AddSectionRequest>;

export const DeleteSectionRequest = AddSectionRequest;
export type DeleteSectionRequest = AddSectionRequest;

export const SetSectionAttrRequest = z.object({
    scheduleId: ScheduleId,
    section: SectionIdentifier,
    attrs: UserSectionAttrs,
});
export type SetSectionAttrRequest = z.infer<typeof SetSectionAttrRequest>;

export const ImportV3Request = z.object({
    courses: z
        .object({
            code: z.string(),
            selected: z.boolean(),
        })
        .array(),
});
export type ImportV3Request = z.infer<typeof ImportV3Request>;
export const ImportV3Response = z.object({
    scheduleId: ScheduleId,
});
export type ImportV3Response = z.infer<typeof ImportV3Response>;

export const SetActiveScheduleRequest = z.object({
    scheduleId: ScheduleId,
});
export type SetActiveScheduleRequest = z.infer<typeof SetActiveScheduleRequest>;

export const ReplaceSectionsRequest = z.object({
    scheduleId: ScheduleId,
    sections: UserSection.array(),
});
export type ReplaceSectionsRequest = z.infer<typeof ReplaceSectionsRequest>;
