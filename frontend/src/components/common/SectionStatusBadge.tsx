import type * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./SectionStatusBadge.module.css";

export default function SectionStatusBadge({
    status,
}: {
    readonly status: APIv4.SectionStatus;
}) {
    return <span data-status={status} className={Css.badge} />;
}
