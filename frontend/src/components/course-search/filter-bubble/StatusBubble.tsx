import type * as Search from "@lib/search";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import * as APIv4 from "hyperschedule-shared/api/v4";
import AutoComplete from "./AutoComplete";
import { memo } from "react";

const StringToSectionStatusMap: Record<string, APIv4.SectionStatus> = {
    Open: APIv4.SectionStatus.open,
    Closed: APIv4.SectionStatus.closed,
    Reopened: APIv4.SectionStatus.reopened,
};

export default memo(function StatusBubble(
    props: FilterBubbleComponentProps<Search.StatusFilter>,
) {
    const statusOptionStrings = Object.keys(StringToSectionStatusMap);
    const statusOptionValues = Object.values(StringToSectionStatusMap);

    return (
        <AutoComplete
            onSelect={(index) => {
                const status = statusOptionValues[index];
                if (status !== undefined) {
                    props.onChange({ status });
                    props.focusNext();
                }
            }}
            onKeyDown={props.onKeyDown}
            choices={statusOptionStrings}
            render={({ index }) => {
                return <span>{statusOptionStrings[index]}</span>;
            }}
        />
    );
});
