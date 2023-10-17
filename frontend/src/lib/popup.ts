import type * as APIv4 from "hyperschedule-shared/api/v4";

export const enum PopupOption {
    Login = "login",
    SectionDetail = "section",
    UserDetail = "user",
    Filter = "filter",
    ManageSchedules = "manage-schedules",
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
          option: PopupOption.UserDetail;
      }
    | {
          option: PopupOption.Filter;
      }
    | { option: PopupOption.ManageSchedules }
    | null;
