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
import PopupAlternativeLine from "./PopupAlternativeLine";
import PopupScheduleSelector from "@components/popup/PopupScheduleSelector";

export default function ManageSchedules() {
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);

    const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
        activeScheduleId ?? "",
    );

    return (
        <PopupAlternativeLine
            className={Css.manageSchedules}
            left={
                <CreateSchedule setSelectedScheduleId={setSelectedScheduleId} />
            }
            right={
                <EditSchedule
                    key={
                        /* setting key here so it will remove pending actions on schedule change */
                        selectedScheduleId
                    }
                    setSelectedScheduleId={setSelectedScheduleId}
                    selectedScheduleId={selectedScheduleId}
                />
            }
        />
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

    function createSchedule() {
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
    }

    return (
        <div className={Css.createScheduleContainer}>
            <h3 className={Css.title}>Create Schedule</h3>

            <div className={Css.createScheduleTerm}>
                <Dropdown
                    choices={allTerms}
                    selected={selectedTerm}
                    onSelect={(index) => setSelectedTerm(allTerms[index]!)}
                    emptyPlaceholder={"none"}
                />
            </div>
            <input
                className={Css.createScheduleName}
                type="text"
                placeholder="Schedule Name"
                value={newScheduleName}
                onChange={(ev) => setNewScheduleName(ev.target.value)}
                onKeyDown={(ev) => {
                    if (ev.code === "Enter") createSchedule();
                }}
            />
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.createScheduleButton,
                )}
                onClick={createSchedule}
            >
                <Feather.FilePlus className={AppCss.defaultButtonIcon} /> create
                schedule
            </button>
        </div>
    );
}

const enum EditSchedulePending {
    delete = "delete",
    duplicate = "duplicate",
    rename = "rename",
}

function EditSchedule(props: {
    selectedScheduleId: string;
    setSelectedScheduleId: (val: string) => void;
}) {
    const deleteSchedule = useUserStore((store) => store.deleteSchedule);
    const renameSchedule = useUserStore((store) => store.renameSchedule);
    const duplicateSchedule = useUserStore((store) => store.duplicateSchedule);

    const [name, setName] = useState<string>("");
    const [pending, setPending] = useState<EditSchedulePending | null>(null);

    const schedules = useUserStore((store) => store.schedules);
    const schedulesSorted = APIv4.getSchedulesSorted(schedules);

    const selectedSchedule = schedules[props.selectedScheduleId];

    function performScheduleDeletion() {
        deleteSchedule({
            scheduleId: props.selectedScheduleId,
        });

        const scheduleIds = schedulesSorted.map((s) => s[0]);
        // we just want to possibly come up with another selection if we can,
        // no point trying too hard here
        const newScheduleId: string | undefined =
            scheduleIds[0] === props.selectedScheduleId
                ? scheduleIds[1]
                : scheduleIds[0];

        props.setSelectedScheduleId(newScheduleId ?? "");
    }

    function performScheduleRename() {
        if (name.trim() === "") {
            toast.error("New schedule name cannot be empty");
            return;
        }

        setName("");
        renameSchedule({
            scheduleId: props.selectedScheduleId,
            name: name.trim(),
        });
    }

    function performScheduleDuplication() {
        if (name.trim() === "") {
            toast.error("New schedule name cannot be empty");
            return;
        }

        setName("");
        duplicateSchedule({
            scheduleId: props.selectedScheduleId,
            name: name.trim(),
        })
            .then(props.setSelectedScheduleId)
            .catch(() => {});
    }

    function confirmPending() {
        switch (pending) {
            case EditSchedulePending.duplicate:
                performScheduleDuplication();
                break;
            case EditSchedulePending.delete:
                performScheduleDeletion();
                break;
            case EditSchedulePending.rename:
                performScheduleRename();
        }
        setPending(null);
    }

    return (
        <div
            className={Css.editScheduleContainer}
            data-pending-action={pending ?? undefined}
        >
            <h3 className={Css.title}>Edit Existing Schedules</h3>

            <div className={Css.editScheduleDropdown}>
                <PopupScheduleSelector {...props} />
            </div>
            {selectedSchedule === undefined ? (
                <></>
            ) : (
                <>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.deleteButton,
                        )}
                        onClick={() => setPending(EditSchedulePending.delete)}
                    >
                        <Feather.Trash className={AppCss.defaultButtonIcon} />{" "}
                        delete
                    </button>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.renameButton,
                        )}
                        onClick={() => setPending(EditSchedulePending.rename)}
                    >
                        <Feather.Edit3 className={AppCss.defaultButtonIcon} />
                        rename
                    </button>

                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.duplicateButton,
                        )}
                        onClick={() =>
                            setPending(EditSchedulePending.duplicate)
                        }
                    >
                        <Feather.Copy className={AppCss.defaultButtonIcon} />
                        duplicate
                    </button>

                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.cancelButton,
                        )}
                        onClick={() => setPending(null)}
                    >
                        <Feather.X className={AppCss.defaultButtonIcon} />
                        cancel
                    </button>

                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.confirmButton,
                        )}
                        onClick={confirmPending}
                    >
                        <Feather.Check className={AppCss.defaultButtonIcon} />
                        confirm
                    </button>

                    <span className={Css.sectionCount}>
                        (contains{" "}
                        {selectedSchedule.sections.length === 0
                            ? "nothing inside"
                            : `${selectedSchedule.sections.length} sections`}
                        )
                    </span>

                    <input
                        className={classNames(Css.newName)}
                        type="text"
                        placeholder="new name"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                        onKeyDown={(ev) => {
                            if (ev.code === "Enter") confirmPending();
                        }}
                    />
                </>
            )}
        </div>
    );
}
