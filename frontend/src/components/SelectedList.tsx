import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import {
    useScheduleSectionAttrsMutation,
    useScheduleReplaceSectionsMutation,
} from "@hooks/api/user";
import useStore, { PopupOption } from "@hooks/store";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { sectionColorStyle } from "@lib/color";
import { useState } from "react";

import * as DndCore from "@dnd-kit/core";
import * as DndSortable from "@dnd-kit/sortable";
import * as DndUtil from "@dnd-kit/utilities";

import * as Feather from "react-feather";

import Css from "./SelectedList.module.css";

export default function SelectedList() {
    const schedule = useActiveSchedule();
    const sectionsLookup = useActiveSectionsLookup();
    const replaceSectionsMutation = useScheduleReplaceSectionsMutation();

    const sensors = DndCore.useSensors(
        DndCore.useSensor(DndCore.PointerSensor),
    );

    const [reorderMode, setReorderMode] = useState(false);
    const [activeEntry, setActiveEntry] = useState<string | null>(null);

    const [sectionsOrder, setSectionsOrder] = useState<APIv4.UserSection[]>([]);

    if (!schedule) return <></>;

    return (
        <div className={Css.container}>
            <div>
                {reorderMode ? (
                    <>
                        <button
                            onClick={() => {
                                replaceSectionsMutation.mutate({
                                    scheduleId: schedule._id,
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
                            setSectionsOrder(schedule.sections);
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
                        {(reorderMode ? sectionsOrder : schedule.sections).map(
                            (entry) => (
                                <SectionEntry
                                    key={APIv4.stringifySectionCodeLong(
                                        entry.section,
                                    )}
                                    entry={entry}
                                />
                            ),
                        )}
                    </DndSortable.SortableContext>
                    <DndCore.DragOverlay></DndCore.DragOverlay>
                </DndCore.DndContext>
            </div>
        </div>
    );
}

function SectionEntry({ entry }: { entry: APIv4.UserSection }) {
    const schedule = useActiveSchedule();

    const sectionsLookup = useActiveSectionsLookup();
    const attrsMutation = useScheduleSectionAttrsMutation();
    const theme = useStore((store) => store.theme);

    const sortable = DndSortable.useSortable({
        id: APIv4.stringifySectionCodeLong(entry.section),
    });

    if (!schedule) return <></>;

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
                onClick={() => {
                    attrsMutation.mutate({
                        section: entry.section,
                        scheduleId: schedule._id,
                        attrs: {
                            selected: !entry.attrs.selected,
                        },
                    });
                }}
            >
                {entry.attrs.selected ? (
                    <Feather.CheckSquare />
                ) : (
                    <Feather.Square />
                )}
            </button>
            <div
                onClick={
                    () => undefined
                    //setPopup({
                    //    option: PopupOption.SectionDetail,
                    //    section: entry.section,
                    //})
                }
            >
                {APIv4.stringifySectionCode(entry.section)}{" "}
                {section?.course.title ?? null}
            </div>
        </div>
    );
}
