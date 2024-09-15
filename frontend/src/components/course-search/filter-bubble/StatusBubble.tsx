import * as Search from "@lib/search";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import AutoComplete from "./AutoComplete";
import { memo } from "react";

export default memo(function StatusBubble(
    props: FilterBubbleComponentProps<Search.StatusFilter>,
) {

    const statusOptions = Object.values(Search.StatusFilterOptions);

    return (
        <AutoComplete
            onSelect={(index) => {
                const status = statusOptions[index];
                if (status !== undefined) {
                    props.onChange({ status });
                    props.focusNext();
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
