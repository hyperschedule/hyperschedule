import type * as Search from "@lib/search";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import * as APIv4 from "hyperschedule-shared/api/v4";
import AutoComplete from "./AutoComplete";
import { memo } from "react";

const StringToSectionStatusMap: Record<string, APIv4.SectionStatus> = {
    Open: APIv4.SectionStatus.open,
    Closed: APIv4.SectionStatus.closed,
    Reopened: APIv4.SectionStatus.reopened,
    Unknown: APIv4.SectionStatus.unknown,
};

export default memo(function StatusBubble(
    props: FilterBubbleComponentProps<Search.StatusFilter>,
) {
    const statusOptions = Object.keys(StringToSectionStatusMap);

    return (
        <AutoComplete
            onSelect={(index) => {
                const statusName = statusOptions[index];
                if (statusName !== undefined) {
                    const status = StringToSectionStatusMap[statusName];
                    if (status !== undefined) {
                        props.onChange({ status });
                        props.focusNext();
                    }
                }
            }}
            onKeyDown={props.onKeyDown}
            choices={statusOptions}
            render={({ index }) => {
                return <span>{statusOptions[index]}</span>;
            }}
        />
    );
});
