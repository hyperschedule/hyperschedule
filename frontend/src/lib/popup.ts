import type * as APIv4 from "hyperschedule-shared/api/v4";

export const enum PopupOption {
    Login = "login",
    SectionDetail = "section",
    Settings = "settings",
    Filter = "filter",
    ManageSchedules = "manage-schedules",
    ExportCalendar = "export-calendar",
    About = "about",
}

export type Popup =
    | {
          option: PopupOption.Login;
          continuation?: () => void;
      }
    | {
          option: PopupOption.SectionDetail;
          section: APIv4.SectionIdentifier;
      }
    | {
          option: PopupOption.Settings;
      }
    | {
          option: PopupOption.Filter;
      }
    | { option: PopupOption.ManageSchedules }
    | { option: PopupOption.ExportCalendar }
    | { option: PopupOption.About }
    | null;
