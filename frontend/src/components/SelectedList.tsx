import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import { useScheduleSectionAttrsMutation } from "@hooks/api/user";
import useStore, { PopupOption } from "@hooks/store";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { sectionColorStyle } from "@lib/section";

import Css from "./SelectedList.module.css";

export default function SelectedList() {
    const schedule = useActiveSchedule();
    const sectionsLookup = useActiveSectionsLookup();

    const attrsMutation = useScheduleSectionAttrsMutation();
    const setPopup = useStore((store) => store.setPopup);
    if (!schedule) return <></>;
    return (
        <div className={Css.list}>
            {schedule.sections.map((entry) => {
                const section = sectionsLookup.get(
                    APIv4.stringifySectionCodeLong(entry.section),
                );

                return (
                    <div
                        className={Css.entry}
                        style={sectionColorStyle(entry.section)}
                        key={APIv4.stringifySectionCodeLong(entry.section)}
                    >
                        <button
                            onClick={() => {
                                attrsMutation.mutate({
                                    section: entry.section,
                                    scheduleId: schedule._id,
                                    attrs: { selected: !entry.attrs.selected },
                                });
                            }}
                        >
                            {+entry.attrs.selected}
                        </button>
                        <div
                            onClick={() =>
                                setPopup({
                                    option: PopupOption.SectionDetail,
                                    section: entry.section,
                                })
                            }
                        >
                            {APIv4.stringifySectionCode(entry.section)}{" "}
                            {section?.course.title ?? null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
