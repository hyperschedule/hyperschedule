import Css from "./ManageSchedules.module.css";
import { useUserStore } from "@hooks/store/user";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Dropdown from "@components/common/Dropdown";
import { useAllTerms } from "@hooks/term";
import { useState } from "react";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import * as Feather from "react-feather";
import classNames from "classnames";
import AppCss from "@components/App.module.css";
import { toast } from "react-toastify";

export default function ManageSchedules() {
    const schedules = useUserStore((store) => store.schedules);
    const addSchedule = useUserStore((store) => store.addSchedule);
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);
    const setActiveScheduleId = useUserStore(
        (store) => store.setActiveScheduleId,
    );

    const schedulesSorted = APIv4.getSchedulesSorted(schedules);

    const allTerms = (useAllTerms() ?? []).map(APIv4.stringifyTermIdentifier);
    const [selectedTerm, setSelectedTerm] = useState<string>(
        APIv4.stringifyTermIdentifier(CURRENT_TERM),
    );
    const [newScheduleName, setNewScheduleName] = useState<string>("");

    return (
        <div className={Css.container}>
            <h3>Manage schedules</h3>

            <div className={Css.createSchedule}>
                <Dropdown
                    choices={allTerms}
                    selected={selectedTerm}
                    onSelect={(index) => setSelectedTerm(allTerms[index]!)}
                    emptyPlaceholder={"none"}
                />
                <input
                    type="text"
                    placeholder="Schedule Name"
                    value={newScheduleName}
                    onChange={(ev) => setNewScheduleName(ev.target.value)}
                />
                <button
                    className={classNames(AppCss.defaultButton)}
                    onClick={() => {
                        const name = newScheduleName.trim();
                        if (name === "") {
                            toast.error("Schedule name cannot be empty");
                            return;
                        }
                        setNewScheduleName("");
                        addSchedule({
                            name: newScheduleName,
                            term: APIv4.parseTermIdentifier(selectedTerm),
                        })
                            .then(setActiveScheduleId)
                            .catch(() => {});
                    }}
                >
                    <Feather.FilePlus className={AppCss.defaultButtonIcon} />{" "}
                    create schedule
                </button>
            </div>

            {schedulesSorted.map(([id, schedule]) => {
                return (
                    <EditSchedule
                        key={id}
                        id={id}
                        schedule={schedule}
                        isActive={id === activeScheduleId}
                    />
                );
            })}
        </div>
    );
}

function EditSchedule(props: {
    id: APIv4.ScheduleId;
    schedule: APIv4.UserSchedule;
    isActive: boolean;
}) {
    const deleteSchedule = useUserStore((store) => store.deleteSchedule);
    const renameSchedule = useUserStore((store) => store.renameSchedule);
    const duplicateSchedule = useUserStore((store) => store.duplicateSchedule);
    const setActiveScheduleId = useUserStore(
        (store) => store.setActiveScheduleId,
    );
    const [name, setName] = useState<string>("");

    return (
        <div className={Css.editScheduleRow}>
            <span className={Css.name}>
                {props.schedule.name}{" "}
                {props.isActive ? <Feather.Check /> : <></>}(
                {APIv4.stringifyTermIdentifier(props.schedule.term)})
            </span>

            <button
                className={classNames(AppCss.defaultButton, Css.deleteButton)}
                onClick={() => {
                    deleteSchedule({ scheduleId: props.id });
                }}
            >
                <Feather.Trash className={AppCss.defaultButtonIcon} /> delete
            </button>
            <input
                className={classNames(AppCss.defaultButton, Css.newName)}
                type="text"
                placeholder="new name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
            />
            <button
                className={classNames(AppCss.defaultButton, Css.renameButton)}
                onClick={() => {
                    setName("");
                    renameSchedule({ scheduleId: props.id, name });
                }}
            >
                <Feather.Edit3 className={AppCss.defaultButtonIcon} />
                rename
            </button>
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.duplicateButton,
                )}
                onClick={() => {
                    setName("");
                    duplicateSchedule({ scheduleId: props.id, name })
                        .then(setActiveScheduleId)
                        .catch(() => {});
                }}
            >
                <Feather.Copy className={AppCss.defaultButtonIcon} />
                duplicate
            </button>
        </div>
    );
}
