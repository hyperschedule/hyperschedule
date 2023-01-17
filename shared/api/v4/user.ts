import type { SectionIdentifier } from "./course";

export interface UserSchedule {
    name: string;
    sections: { identifier: SectionIdentifier; selected: boolean }[];
}

type TermIdentifierString = string;
type ScheduleName = string;

interface UserBase {
    _id: string;
    terms: Record<TermIdentifierString, Record<ScheduleName, UserSchedule>>;
    activeTerm: TermIdentifierString;
    activeSchedule: ScheduleName;
}

export interface GuestUser extends UserBase {
    isGuest: true;
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: number;
}

export interface AuthenticatedUser extends UserBase {
    isGuest: false;
    cxid: number;
}

/**
 * All users are guaranteed to have uuid, isGuest, and schedules fields
 */
export type User = AuthenticatedUser | GuestUser;
