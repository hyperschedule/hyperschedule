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
import { scheduleDisplayName } from "@lib/schedule";

export default function ManageSchedules() {
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);

    const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
        activeScheduleId ?? "",
    );

    return (
        <div className={Css.container}>
            <h3>Manage schedules</h3>
            <CreateSchedule setSelectedScheduleId={setSelectedScheduleId} />
            <EditSchedule
                setSelectedScheduleId={setSelectedScheduleId}
                selectedScheduleId={selectedScheduleId}
            />
        </div>
    );
}

function CreateSchedule(props: {
    setSelectedScheduleId: (val: string) => void;
}) {
    const addSchedule = useUserStore((store) => store.addSchedule);

    const allTerms = (useAllTerms() ?? []).map(APIv4.stringifyTermIdentifier);
    const [selectedTerm, setSelectedTerm] = useState<string>(
        APIv4.stringifyTermIdentifier(CURRENT_TERM),
    );
    const [newScheduleName, setNewScheduleName] = useState<string>("");

    return (
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
                        .then(props.setSelectedScheduleId)
                        .catch(() => {});
                }}
            >
                <Feather.FilePlus className={AppCss.defaultButtonIcon} /> create
                schedule
            </button>
        </div>
    );
}

function EditSchedule(props: {
    selectedScheduleId: string;
    setSelectedScheduleId: (val: string) => void;
}) {
    const deleteSchedule = useUserStore((store) => store.deleteSchedule);
    const renameSchedule = useUserStore((store) => store.renameSchedule);
    const duplicateSchedule = useUserStore((store) => store.duplicateSchedule);
    const [name, setName] = useState<string>("");

    const schedules = useUserStore((store) => store.schedules);
    const schedulesSorted = APIv4.getSchedulesSorted(schedules);
    const scheduleChoices = schedulesSorted.map((s) =>
        scheduleDisplayName(s[1]),
    );

    const selectedSchedule = schedules[props.selectedScheduleId];

    return (
        <div className={Css.editScheduleRow}>
            <Dropdown
                choices={scheduleChoices}
                selected={
                    selectedSchedule === undefined
                        ? ""
                        : scheduleDisplayName(selectedSchedule)
                }
                onSelect={(index) => {
                    props.setSelectedScheduleId(schedulesSorted[index]![0]);
                }}
                emptyPlaceholder={
                    scheduleChoices.length > 0
                        ? "no schedule selected"
                        : "please create a schedule first"
                }
            />
            {selectedSchedule === undefined ? (
                <></>
            ) : (
                <>
                    <span className={Css.name}>
                        {scheduleDisplayName(selectedSchedule)}
                    </span>

                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.deleteButton,
                        )}
                        onClick={() => {
                            deleteSchedule({
                                scheduleId: props.selectedScheduleId,
                            });

                            const scheduleIds = schedulesSorted.map(
                                (s) => s[0],
                            );
                            // we just want to possibly come up with another selection if we can,
                            // no point trying too hard here
                            const newScheduleId: string | undefined =
                                scheduleIds[0] === props.selectedScheduleId
                                    ? scheduleIds[1]
                                    : scheduleIds[0];

                            props.setSelectedScheduleId(newScheduleId ?? "");
                        }}
                    >
                        <Feather.Trash className={AppCss.defaultButtonIcon} />{" "}
                        delete
                    </button>
                    <input
                        className={classNames(
                            AppCss.defaultButton,
                            Css.newName,
                        )}
                        type="text"
                        placeholder="new name"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.renameButton,
                        )}
                        onClick={() => {
                            if (name.trim() === "") {
                                toast.error(
                                    "New schedule name cannot be empty",
                                );
                                return;
                            }

                            setName("");
                            renameSchedule({
                                scheduleId: props.selectedScheduleId,
                                name: name.trim(),
                            });
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
                            if (name.trim() === "") {
                                toast.error(
                                    "New schedule name cannot be empty",
                                );
                                return;
                            }

                            setName("");
                            duplicateSchedule({
                                scheduleId: props.selectedScheduleId,
                                name: name.trim(),
                            })
                                .then(props.setSelectedScheduleId)
                                .catch(() => {});
                        }}
                    >
                        <Feather.Copy className={AppCss.defaultButtonIcon} />
                        duplicate
                    </button>
                </>
            )}
        </div>
    );
}
