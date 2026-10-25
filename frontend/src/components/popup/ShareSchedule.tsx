import Css from "./ShareSchedule.module.css";
import AppCss from "@components/App.module.css";
import PopupScheduleSelector from "@components/popup/PopupScheduleSelector";
import { useCallback, useState } from "react";
import { useUserStore } from "@hooks/store/user";
import { toast } from "react-toastify";
import classNames from "classnames";

export default function ShareSchedule() {
    const activeScheduleId = useUserStore((user) => user.activeScheduleId);
    const serverData = useUserStore((user) => user.server);
    const schedules = useUserStore((store) => store.schedules);
    const shareSchedule = useUserStore((store) => store.shareSchedule);
    const unshareSchedule = useUserStore((store) => store.unshareSchedule);

    const [scheduleId, setScheduleId] = useState<string>(
        activeScheduleId ?? "",
    );

    const sharedId = schedules[scheduleId]?.sharedId;
    const scheduleLink = sharedId
        ? `${__API_URL__}/v4/user/schedule/share/${sharedId}`
        : "Enable link sharing to get link";

    const toggleShared = useCallback(async () => {
        if (sharedId) {
            await unshareSchedule({ scheduleId: scheduleId });
        } else {
            await shareSchedule({ scheduleId: scheduleId });
        }
    }, [sharedId, unshareSchedule, shareSchedule, scheduleId]);

    return serverData === null ? (
        <div>
            Sorry, you cannot share your schedule because you are not logged in.
            Please go to settings and log in first.
        </div>
    ) : (
        <div className={Css.shareSchedule}>
            <h2>Share Schedule</h2>
            <div className={Css.scheduleWrapper}>
                <div className={Css.scheduleSelect}>
                    <PopupScheduleSelector
                        selectedScheduleId={scheduleId}
                        setSelectedScheduleId={setScheduleId}
                    />
                </div>
                <button
                    className={AppCss.defaultButton}
                    onClick={() => {
                        void toggleShared();
                    }}
                >
                    {sharedId ? (
                        <>Disable Link Sharing</>
                    ) : (
                        <>Enable Link Sharing</>
                    )}
                </button>
            </div>
            <div>
                <h3>Shareable Link</h3>
                <code
                    className={classNames(Css.linkContainer, {
                        [Css.disabled]: !sharedId,
                    })}
                    onClick={() => {
                        if (!sharedId) return;
                        navigator.clipboard
                            .writeText(scheduleLink)
                            .then(() => {
                                toast.success("Link Copied");
                            })
                            .catch(() => {});
                    }}
                >
                    <pre className={Css.shareLink}>{scheduleLink}</pre>
                </code>
            </div>
        </div>
    );
}
