import Css from "./ExportCalendar.module.css";
import PopupScheduleSelector from "@components/popup/PopupScheduleSelector";
import { useState } from "react";

export default function ExportCalendar() {
    const [scheduleId, setScheduleId] = useState<string>("");

    return (
        <div className={Css.exportCalendar}>
            <div className={Css.scheduleSelect}>
                <span>Select schedule to export</span>
                <PopupScheduleSelector
                    selectedScheduleId={scheduleId}
                    setSelectedScheduleId={setScheduleId}
                />
            </div>
        </div>
    );
}
