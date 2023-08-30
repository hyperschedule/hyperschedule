import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import {
    useScheduleReplaceSectionsMutation,
    useScheduleSectionAttrsMutation,
    useScheduleSectionMutation,
} from "@hooks/api/user";
import useStore, { MainTab, PopupOption } from "@hooks/store";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { sectionColorStyle } from "@lib/color";
import { useState } from "react";

import * as DndCore from "@dnd-kit/core";
import * as DndSortable from "@dnd-kit/sortable";
import * as DndUtil from "@dnd-kit/utilities";

import * as Feather from "react-feather";

import Css from "./SelectedList.module.css";
import SectionStatusBadge from "@components/common/SectionStatusBadge";
import { toast } from "react-toastify";

export default function SelectedList() {
    const activeSchedule = useActiveSchedule();

    const sectionsLookup = useActiveSectionsLookup();
    const replaceSectionsMutation = useScheduleReplaceSectionsMutation();

    const activeScheduleId = useStore((store) => store.activeScheduleId);

    const [reorderMode, setReorderMode] = useState(false);
    const [activeEntry, setActiveEntry] = useState<string | null>(null);

    const [sectionsOrder, setSectionsOrder] = useState<APIv4.UserSection[]>([]);

    const sensors = DndCore.useSensors(
        DndCore.useSensor(DndCore.PointerSensor),
    );

    if (activeScheduleId === null) return <></>;
    if (activeSchedule === undefined) {
        toast.error(
            "Unexpected error: cannot find data for selected schedule. You may be able to fix this by selecting a schedule, then reload the page.",
            { autoClose: false },
        );
        return <></>;
    }

    return (
        <div className={Css.container}>
            <div>
                {reorderMode ? (
                    <>
                        <button
                            onClick={() => {
                                replaceSectionsMutation.mutate({
                                    scheduleId: activeScheduleId,
                                    sections: sectionsOrder,
                                });
                                setReorderMode(false);
                            }}
                        >
                            ok
                        </button>
                        <button onClick={() => setReorderMode(false)}>
                            cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setSectionsOrder(activeSchedule.sections);
                            setReorderMode(true);
                        }}
                    >
                        reorder
                    </button>
                )}
            </div>
            <div
                className={Css.list}
                {...(reorderMode ? { "data-reordering": true } : {})}
            >
                <DndCore.DndContext
                    collisionDetection={DndCore.closestCenter}
                    sensors={sensors}
                    onDragStart={(event) =>
                        setActiveEntry(event.active.id as string)
                    }
                    onDragEnd={(event) => {
                        if (!event.over || event.active.id === event.over.id)
                            return;

                        const oldId = event.active.id;
                        const newId = event.over.id;

                        const oldIndex = sectionsOrder.findIndex(
                            (entry) =>
                                APIv4.stringifySectionCodeLong(
                                    entry.section,
                                ) === oldId,
                        );
                        const newIndex = sectionsOrder.findIndex(
                            (entry) =>
                                APIv4.stringifySectionCodeLong(
                                    entry.section,
                                ) === newId,
                        );

                        setSectionsOrder(
                            DndSortable.arrayMove(
                                sectionsOrder,
                                oldIndex,
                                newIndex,
                            ),
                        );
                    }}
                >
                    <DndSortable.SortableContext
                        items={sectionsOrder.map((entry) =>
                            APIv4.stringifySectionCodeLong(entry.section),
                        )}
                        strategy={DndSortable.verticalListSortingStrategy}
                        disabled={!reorderMode}
                    >
                        {(reorderMode
                            ? sectionsOrder
                            : activeSchedule.sections
                        ).map((entry) => (
                            <SectionEntry
                                key={APIv4.stringifySectionCodeLong(
                                    entry.section,
                                )}
                                entry={entry}
                                scheduleId={activeScheduleId}
                            />
                        ))}
                    </DndSortable.SortableContext>
                    <DndCore.DragOverlay></DndCore.DragOverlay>
                </DndCore.DndContext>
            </div>
        </div>
    );
}

function SectionEntry({
    entry,
    scheduleId,
}: {
    entry: APIv4.UserSection;
    scheduleId: APIv4.ScheduleId;
}) {
    const sectionsLookup = useActiveSectionsLookup();
    const attrsMutation = useScheduleSectionAttrsMutation();
    const theme = useStore((store) => store.theme);
    const setPopup = useStore((store) => store.setPopup);
    const mainTab = useStore((store) => store.mainTab);
    const scrollToSection = useStore((store) => store.scrollToSection);
    const setExpandKey = useStore((store) => store.setExpandKey);
    const sortable = DndSortable.useSortable({
        id: APIv4.stringifySectionCodeLong(entry.section),
    });

    const scheduleSelectMutation = useScheduleSectionMutation();

    const iconProps = {
        strokeWidth: 1.5,
        size: "1.25em",
        preserveAspectRatio: "",
    };

    const section = sectionsLookup.get(
        APIv4.stringifySectionCodeLong(entry.section),
    );

    return (
        <div
            ref={sortable.setNodeRef}
            className={Css.entry}
            style={{
                ...sectionColorStyle(entry.section, theme),
                transform: DndUtil.CSS.Transform.toString(sortable.transform),
                transition: sortable.transition,
            }}
            {...sortable.attributes}
            {...sortable.listeners}
        >
            <button
                className={Css.selectButton}
                onClick={() => {
                    attrsMutation.mutate({
                        section: entry.section,
                        scheduleId: scheduleId,
                        attrs: {
                            selected: !entry.attrs.selected,
                        },
                    });
                }}
            >
                {entry.attrs.selected ? (
                    <Feather.CheckSquare {...iconProps} />
                ) : (
                    <Feather.Square {...iconProps} />
                )}
            </button>
            <span
                className={Css.text}
                onClick={() => {
                    if (mainTab === MainTab.CourseSearch) {
                        setExpandKey(entry.section);
                        scrollToSection(entry.section);
                    } else
                        setPopup({
                            option: PopupOption.SectionDetail,
                            section: entry.section,
                        });
                }}
            >
                <span className={Css.code}>
                    {APIv4.stringifySectionCode(entry.section)}{" "}
                </span>
                <span className={Css.title}>
                    {section?.course.title ?? "(section no longer exists)"}
                </span>
            </span>
            {section !== undefined ? (
                <>
                    <span className={Css.enrollments}>
                        {section.seatsFilled}/{section.seatsTotal}
                    </span>
                    <span className={Css.badge}>
                        <SectionStatusBadge status={section.status} />
                    </span>
                </>
            ) : (
                <></>
            )}
            <button
                className={Css.deleteButton}
                onClick={() => {
                    scheduleSelectMutation.mutate({
                        section: entry.section,
                        add: false,
                        scheduleId,
                    });
                }}
            >
                <Feather.Trash2 {...iconProps} />
            </button>
        </div>
    );
}
