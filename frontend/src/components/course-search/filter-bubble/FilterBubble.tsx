import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React from "react";
import * as Feather from "react-feather";

import { DaysFilterBubble, TextInputBubble } from "./TextInputBubble";
import CourseAreaBubble from "./CourseAreaBubble";
import CampusBubble from "./CampusBubble";
import { TimeFilterBubble, CreditFilterBubble } from "./RangeFilter";

export type FilterBubbleComponentProps<Data> = {
    onChange: (data: Data | null) => void;
    onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
    focusNext: () => void;
};
export type FilterBubbleComponent<K extends Search.FilterKey> = React.FC<
    FilterBubbleComponentProps<Search.FilterData[K]>
>;

const FilterBubbleInput: {
    [K in Search.FilterKey]: FilterBubbleComponent<K>;
} = {
    [Search.FilterKey.Department]: TextInputBubble,
    [Search.FilterKey.Instructor]: TextInputBubble,
    [Search.FilterKey.Description]: TextInputBubble,
    [Search.FilterKey.CourseCode]: TextInputBubble,
    [Search.FilterKey.Title]: TextInputBubble,
    [Search.FilterKey.Location]: TextInputBubble,
    [Search.FilterKey.ScheduleDays]: DaysFilterBubble,
    [Search.FilterKey.MeetingTime]: TimeFilterBubble,
    [Search.FilterKey.Credits]: CreditFilterBubble,
    [Search.FilterKey.CourseArea]: CourseAreaBubble,
    [Search.FilterKey.Campus]: CampusBubble,
};

// non-interactive example bubble used in the filter popup
export function ExampleFilterBubble(props: {
    filterKey: string;
    data: string;
}) {
    return (
        <div className={Css.bubble}>
            <span className={Css.filterKey}>{props.filterKey}</span>
            <span className={Css.filterData}>
                <span style={{ paddingRight: "1em" }}>{props.data}</span>
            </span>
        </div>
    );
}

export default function FilterBubble(props: {
    filter: Search.Filter;
    index: number;
    focusOnFilter: (index: number, cursor: number) => void;
}) {
    const setSearchFilter = useStore((store) => store.setSearchFilter);
    const removeSearchFilter = useStore((store) => store.removeSearchFilter);

    // A little type trickery to enable implementing per-key components in a record,
    // which is nicer to write than a bunch of if-else or switch-case code.
    // FilterBubbleInput is typed to make sure the type of the component's props
    // matches its corresponding key, but TS doesn't understand this yet,
    // so we do a little type cast to appease it.
    const InputComponent = FilterBubbleInput[
        props.filter.key
    ] as FilterBubbleComponent<Search.FilterKey>;

    return (
        <div className={Css.bubble}>
            <span className={Css.filterKey}>{props.filter.key}</span>
            <span className={Css.filterData}>
                <InputComponent
                    focusNext={() => props.focusOnFilter(props.index + 1, 0)}
                    onChange={(data) => {
                        setSearchFilter(props.index, {
                            key: props.filter.key,
                            data,
                        } as Search.Filter);
                    }}
                    onKeyDown={(ev) => {
                        const el = ev.currentTarget;
                        if (ev.code === "ArrowLeft") {
                            if (
                                el.selectionStart === 0 &&
                                el.selectionEnd === 0
                            )
                                props.focusOnFilter(
                                    props.index - 1,
                                    Number.MAX_SAFE_INTEGER,
                                );
                        } else if (ev.code === "ArrowRight") {
                            if (
                                el.selectionStart === el.value.length &&
                                el.selectionEnd === el.value.length
                            )
                                props.focusOnFilter(props.index + 1, 0);
                        } else if (ev.code === "Backspace") {
                            if (ev.currentTarget.value.length === 0) {
                                removeSearchFilter(props.index);
                                props.focusOnFilter(props.index + 1, 0);
                            }
                        }
                    }}
                />
                <Feather.X
                    className={Css.closeIcon}
                    onClick={() => removeSearchFilter(props.index)}
                />
            </span>
        </div>
    );
}
