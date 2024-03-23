import type { ReactNode } from "react";

export type AnnouncementID = number;

export type Announcement = {
    id: AnnouncementID;
    // using ReactNode so we can possibly send out interactive announcements
    message: ReactNode;
    expires: Date | null;
};
