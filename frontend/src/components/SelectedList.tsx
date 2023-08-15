import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import { useScheduleSectionAttrsMutation } from "@hooks/api/user";

import * as APIv4 from "hyperschedule-shared/api/v4";

import Css from "./SelectedList.module.css";

export default function SelectedList() {
    const schedule = useActiveSchedule();
    const sectionsLookup = useActiveSectionsLookup();

    const attrsMutation = useScheduleSectionAttrsMutation();

    if (!schedule) return <></>;
    return (
        <div>
            {schedule.sections.map((entry) => {
                const section = sectionsLookup.get(
                    APIv4.stringifySectionCodeLong(entry.section),
                );

                return (
                    <div key={APIv4.stringifySectionCodeLong(entry.section)}>
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
                        {APIv4.stringifySectionCode(entry.section)}{" "}
                        {section?.course.title ?? null}
                    </div>
                );
            })}
        </div>
    );
}
