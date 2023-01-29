import type { UserToken } from "./auth/token";

// type augmentation because we are attaching our verified user instance
// onto each request using a middleware. see middleware.ts
declare module "@tinyhttp/app" {
    export interface Request {
        id: number;
        userToken: UserToken | null;
    }
}
