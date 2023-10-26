import Css from "./ExportCalendar.module.css";
import AppCss from "@components/App.module.css";
import PopupScheduleSelector from "@components/popup/PopupScheduleSelector";
import { useState } from "react";
import { useUserStore } from "@hooks/store/user";
import * as Feather from "react-feather";
import { toast } from "react-toastify";

export default function ExportCalendar() {
    const activeScheduleId = useUserStore((user) => user.activeScheduleId);
    const serverData = useUserStore((user) => user.server);

    const [scheduleId, setScheduleId] = useState<string>(
        activeScheduleId ?? "",
    );

    const icalLink = `${__API_URL__}/v4/calendar/${serverData?._id}/${scheduleId}`;

    return serverData === null ? (
        <div>
            Sorry, you cannot export your calendar because you are not logged
            in. Please go to settings and log in first.
        </div>
    ) : (
        <div className={Css.exportCalendar}>
            <h2>Export Calendar</h2>
            <div className={Css.scheduleSelect}>
                <PopupScheduleSelector
                    selectedScheduleId={scheduleId}
                    setSelectedScheduleId={setScheduleId}
                />
            </div>
            {scheduleId === "" ? (
                <></>
            ) : (
                <>
                    <div>
                        <h3>Calendar Subscription Link</h3>
                        <code
                            className={Css.linkContainer}
                            onClick={() => {
                                navigator.clipboard
                                    .writeText(icalLink)
                                    .then(() => {
                                        toast.success("Link Copied");
                                    })
                                    .catch(() => {});
                            }}
                        >
                            <pre className={Css.icalLink}>{icalLink}</pre>
                        </code>
                        <a
                            className={AppCss.defaultButton}
                            href={icalLink}
                            download
                        >
                            <Feather.Download />
                            Download iCal File
                        </a>
                    </div>
                    <div>
                        <h3>How do calendar subscriptions work?</h3>
                        <p>
                            Essentially, instead of reading from a file, your
                            calendar program will import a link and periodically
                            check for new updates. This way, all change you make
                            on Hyperschedule can be automatically synchronized
                            to your calendar.
                        </p>
                        <p>
                            Here are the instructions for some popular calendar
                            programs
                        </p>
                        <div className={Css.links}>
                            <a
                                className={AppCss.defaultButton}
                                target="_blank"
                                href="https://support.apple.com/guide/calendar/subscribe-to-calendars-icl1022/mac"
                            >
                                Apple Calendar
                                <Feather.ExternalLink />
                            </a>
                            <a
                                className={AppCss.defaultButton}
                                target="_blank"
                                href="https://support.google.com/calendar/answer/37100#:~:text=Use%20a%20link%20to%20add%20a%20public%20calendar"
                            >
                                Google Calendar <Feather.ExternalLink />
                            </a>
                            <a
                                className={AppCss.defaultButton}
                                target="_blank"
                                href="https://support.microsoft.com/en-us/office/import-or-subscribe-to-a-calendar-in-outlook-com-cff1429c-5af6-41ec-a5b4-74f2c278e98c#ID0EDL"
                            >
                                Outlook Calendar <Feather.ExternalLink />
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
