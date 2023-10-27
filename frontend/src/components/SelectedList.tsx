import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";

import useStore from "@hooks/store";
import { PopupOption } from "@lib/popup";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { sectionColorStyle } from "@lib/color";

import { pick } from "@lib/store";

import * as DndCore from "@dnd-kit/core";
import * as DndSortable from "@dnd-kit/sortable";
import * as DndUtil from "@dnd-kit/utilities";

import * as Feather from "react-feather";

import { useUserStore } from "@hooks/store/user";
import Css from "./SelectedList.module.css";
import SectionStatusBadge from "@components/common/SectionStatusBadge";
import { toast } from "react-toastify";

import * as Schedule from "@lib/schedule";
import classNames from "classnames";
import { computeMuddCredits } from "@lib/credits";
import { memo } from "react";

export default memo(function SelectedList() {
    const scheduleRenderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );

    const activeSchedule = useActiveSchedule();
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);
    const scheduleSetSections = useUserStore(
        (store) => store.scheduleSetSections,
    );
    const sectionsLookup = useActiveSectionsLookup();

    const sensors = DndCore.useSensors(
        DndCore.useSensor(DndCore.PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
    );

    if (activeScheduleId === null) return <></>;
    if (activeSchedule === undefined) {
        toast.error(
            "Unexpected error: cannot find data for selected schedule. You may be able to fix this by selecting a different schedule, then reload the page.",
            { autoClose: false },
        );
        return <></>;
    }

    const selectedSections = activeSchedule.sections
        .filter((us) => us.attrs.selected)
        .map((us) =>
            sectionsLookup.get(APIv4.stringifySectionCodeLong(us.section)),
        )
        .filter((s) => s !== undefined) as APIv4.Section[];

    const unconflictingSections = Array.from(
        Schedule.greedyCollect(selectedSections, Schedule.sectionsConflict),
    );

    const unconflictingSet = new Set<string>(
        unconflictingSections.map((s) =>
            APIv4.stringifySectionCodeLong(s.identifier),
        ),
    );

    return (
        <>
            <div className={Css.credits}>
                {scheduleRenderingOptions.showConflicting ? (
                    <span>
                        {selectedSections
                            .map(computeMuddCredits)
                            .reduce((a, b) => a + b, 0)}{" "}
                        credits selected
                    </span>
                ) : (
                    <span>
                        {unconflictingSections
                            .map(computeMuddCredits)
                            .reduce((a, b) => a + b, 0)}{" "}
                        credits displayed
                    </span>
                )}
            </div>

            <div className={Css.container}>
                <div className={Css.list}>
                    <DndCore.DndContext
                        collisionDetection={DndCore.closestCenter}
                        sensors={sensors}
                        onDragEnd={(event) => {
                            if (
                                !event.over ||
                                event.active.id === event.over.id
                            )
                                return;

                            const oldId = event.active.id;
                            const newId = event.over.id;

                            const oldIndex = activeSchedule.sections.findIndex(
                                (entry) =>
                                    APIv4.stringifySectionCodeLong(
                                        entry.section,
                                    ) === oldId,
                            );

                            const newIndex = activeSchedule.sections.findIndex(
                                (entry) =>
                                    APIv4.stringifySectionCodeLong(
                                        entry.section,
                                    ) === newId,
                            );

                            scheduleSetSections({
                                scheduleId: activeScheduleId,
                                sections: DndSortable.arrayMove(
                                    activeSchedule.sections,
                                    oldIndex,
                                    newIndex,
                                ),
                            });
                        }}
                    >
                        <DndSortable.SortableContext
                            items={activeSchedule.sections.map((entry) =>
                                APIv4.stringifySectionCodeLong(entry.section),
                            )}
                            strategy={DndSortable.verticalListSortingStrategy}
                        >
                            {activeSchedule.sections.map((entry) => {
                                const sectionCode =
                                    APIv4.stringifySectionCodeLong(
                                        entry.section,
                                    );
                                const unconflicting =
                                    unconflictingSet.has(sectionCode);
                                return (
                                    <SectionEntry
                                        key={sectionCode}
                                        entry={entry}
                                        scheduleId={activeScheduleId}
                                        unconflicting={unconflicting}
                                    />
                                );
                            })}
                        </DndSortable.SortableContext>
                        <DndCore.DragOverlay></DndCore.DragOverlay>
                    </DndCore.DndContext>
                    {scheduleRenderingOptions.showConflicting ||
                    activeSchedule.sections.length === 0 ? (
                        <></>
                    ) : (
                        <div className={Css.textContainer}>
                            <span>(drag sections to change priorities)</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});

const SectionEntry = memo(function SectionEntry(props: {
    entry: APIv4.UserSection;
    scheduleId: APIv4.ScheduleId;
    unconflicting: boolean;
}) {
    const sectionsLookup = useActiveSectionsLookup();
    //const attrsMutation = useScheduleSectionAttrsMutation();
    const theme = useStore((store) => store.theme);
    const setPopup = useStore((store) => store.setPopup);
    const scheduleRenderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );
    const sortable = DndSortable.useSortable({
        id: APIv4.stringifySectionCodeLong(props.entry.section),
    });

    const { scheduleDeleteSection, scheduleSetSectionAttrs } = useUserStore(
        pick("scheduleDeleteSection", "scheduleSetSectionAttrs"),
    );

    const section = sectionsLookup.get(
        APIv4.stringifySectionCodeLong(props.entry.section),
    );

    const isConflicting =
        props.entry.attrs.selected &&
        !scheduleRenderingOptions.showConflicting &&
        !props.unconflicting;

    return (
        <div
            ref={sortable.setNodeRef}
            className={classNames(Css.entry, {
                [Css.unselected]: !props.entry.attrs.selected,
            })}
            style={{
                ...sectionColorStyle(props.entry.section, theme, true),
                transform: DndUtil.CSS.Transform.toString(sortable.transform),
                transition: sortable.transition,
            }}
            data-show-conflicting={
                scheduleRenderingOptions.showConflicting ? "" : undefined
            }
            {...sortable.attributes}
            {...sortable.listeners}
        >
            <button
                className={Css.selectButton}
                onClick={() => {
                    scheduleSetSectionAttrs({
                        section: props.entry.section,
                        scheduleId: props.scheduleId,
                        attrs: {
                            selected: !props.entry.attrs.selected,
                        },
                    });
                }}
            >
                {props.entry.attrs.selected ? (
                    <Feather.CheckSquare strokeWidth={1.5} />
                ) : (
                    <Feather.Square strokeWidth={1.5} />
                )}
            </button>

            <div
                className={Css.sectionInfo}
                onClick={() => {
                    setPopup({
                        option: PopupOption.SectionDetail,
                        section: props.entry.section,
                    });
                }}
            >
                <span className={Css.code}>
                    {APIv4.stringifySectionCode(props.entry.section)}{" "}
                </span>
                <span className={Css.title}>
                    {section?.course.title ?? "(section no longer exists)"}
                </span>

                {isConflicting ? (
                    <div className={Css.conflictingIcon}>
                        <Feather.EyeOff />
                    </div>
                ) : (
                    <></>
                )}
                {section !== undefined ? (
                    <>
                        <span className={Css.seats}>
                            {section.seatsFilled}/{section.seatsTotal}
                        </span>
                        <span className={Css.badge}>
                            <SectionStatusBadge status={section.status} />
                        </span>
                    </>
                ) : (
                    <>
                        <span className={Css.seats}>(-_-)</span>
                        <span className={Css.badge}>
                            <SectionStatusBadge
                                status={APIv4.SectionStatus.unknown}
                            />
                        </span>
                    </>
                )}
            </div>

            <button
                className={Css.deleteButton}
                onClick={() => {
                    scheduleDeleteSection({
                        section: props.entry.section,
                        scheduleId: props.scheduleId,
                    });
                }}
            >
                <Feather.Trash2 strokeWidth={1.5} />
            </button>
        </div>
    );
});
