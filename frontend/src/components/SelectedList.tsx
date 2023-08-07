import { useActiveSchedule } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import * as APIv4 from "hyperschedule-shared/api/v4";

export default function SelectedList() {
    const schedule = useActiveSchedule();
    const sectionsLookup = useActiveSectionsLookup();

    if (!schedule) return <></>;
    return (
        <>
            {schedule.sections.map((entry) => {
                const section = sectionsLookup.get(
                    APIv4.stringifySectionCodeLong(entry.section),
                );

                return (
                    <div key={APIv4.stringifySectionCodeLong(entry.section)}>
                        {APIv4.stringifySectionCode(entry.section)}{" "}
                        {section?.course.title ?? null}
                    </div>
                );
            })}
        </>
    );
}
