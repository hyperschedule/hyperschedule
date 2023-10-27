import Css from "./FilterBubble.module.css";
import type * as Search from "@lib/search";
import { useCourseAreaDescription } from "@hooks/api/query";
import { useActiveSectionsQuery } from "@hooks/section";
import React from "react";
import classNames from "classnames";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import AutoComplete from "./AutoComplete";
import { memo } from "react";

const campusCss = [
    // this is ordered by the year the school is established
    Css.pom,
    Css.scr,
    Css.cmc,
    Css.hmc,
    Css.ptz,
];

export default memo(function CourseAreaBubble(
    props: FilterBubbleComponentProps<Search.CourseAreaFilter>,
) {
    const courseAreaDescription = useCourseAreaDescription();
    const activeSections = useActiveSectionsQuery().data;

    const relevantAreas = React.useMemo(() => {
        // not all areas exist in a semester
        const descriptions = courseAreaDescription.data;
        if (descriptions === undefined) return [];
        if (activeSections === undefined) return [];
        const areas = new Map<string, string>();
        for (const s of activeSections)
            for (const a of s.courseAreas) {
                const desc = descriptions.get(a);
                if (desc) areas.set(a, desc);
            }

        return Array.from(areas.entries()).map(([area, description]) => ({
            area,
            description,
        }));
    }, [activeSections]);

    return (
        <AutoComplete
            onSelect={(index) => {
                props.onChange(relevantAreas[index] ?? null);
                props.focusNext();
            }}
            onKeyDown={props.onKeyDown}
            choices={relevantAreas.map((v) => v.description)}
            render={({ index }) => {
                const { area, description } = relevantAreas[index]!;
                const campus = area.charCodeAt(0) - 48 - 1; // 48 is the ascii code for '0'
                return (
                    <>
                        {campus < 5 ? (
                            <span
                                className={classNames(
                                    campusCss[campus],
                                    Css.campusIndicator,
                                )}
                            />
                        ) : (
                            <></>
                        )}
                        <span>{description}</span>
                    </>
                );
            }}
        />
    );
});
