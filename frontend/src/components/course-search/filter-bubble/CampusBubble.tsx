import type * as Search from "@lib/search";
import { useActiveSectionsQuery } from "@hooks/section";
import * as APIv4 from "hyperschedule-shared/api/v4";
import React from "react";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import AutoComplete from "./AutoComplete";
import { memo } from "react";

export default memo(function CampusBubble(
    props: FilterBubbleComponentProps<Search.CampusFilter>,
) {
    const activeSections = useActiveSectionsQuery();
    const filteredSchoolCodes: APIv4.School[] = React.useMemo(() => {
        if (activeSections === undefined) return [];
        const campuses = new Set<APIv4.School>();
        for (const s of activeSections) {
            campuses.add(s.course.primaryAssociation);
        }
        return Array.from(campuses.values());
    }, [activeSections]);

    const schools = filteredSchoolCodes.map(APIv4.schoolCodeToName);

    return (
        <AutoComplete
            onSelect={(index) => {
                const campus = filteredSchoolCodes[index];
                if (campus !== undefined) {
                    props.onChange({ campus });
                    props.focusNext();
                }
            }}
            onKeyDown={props.onKeyDown}
            choices={schools}
            render={({ index }) => {
                return <span>{schools[index]}</span>;
            }}
        />
    );
});
