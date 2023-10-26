export const SCHEDULE_CONTAINER_ID = "schedule-container";
export const MAIN_STORE_NAME = "hyperschedule-store";
export const USER_STORE_NAME = "hyperschedule-user";
export const DEFAULT_LOCAL_SCHEDULE_ID = "s~default";
export const DATA_VIEWER_PATH = "/data-viewer/data-viewer.html";
export const GITHUB_LINK = "https://github.com/hyperschedule/hyperschedule";

let AUTH_COOKIE_DOMAIN: string;
if (import.meta.env.DEV) {
    AUTH_COOKIE_DOMAIN = "localhost";
} else {
    // we need the dot before the domain for root domain cookie
    AUTH_COOKIE_DOMAIN = ".hyperschedule.io";
}
export { AUTH_COOKIE_DOMAIN };
