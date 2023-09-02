import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React from "react";
import { useMeasure } from "@react-hookz/web";

export default function FilterBubble({ filter }: { filter: Search.Filter }) {
    const setSearchFilter = useStore((store) => store.setSearchFilter);

    // A little type trickery to enable implementing per-key components in a record,
    // which is nicer to write than a bunch of if-else or switch-case code.
    // FilterBubbleInput is typed to make sure the type of the component's props
    // matches its corresponding key, but TS doesn't understand this yet,
    // so we do a little type cast to appease it.
    const InputComponent = FilterBubbleInput[
        filter.key
    ] as FilterBubbleInputComponent<Search.FilterKey>;

    return (
        <div className={Css.bubble}>
            <span className={Css.filterKey}>{filter.key}</span>{" "}
            {
                <InputComponent
                    {...filter.data}
                    onChange={(data) => {
                        setSearchFilter(filter.key, data);
                    }}
                />
            }
        </div>
    );
}

function FilterBubbleInputUnimplemented() {
    return <>?</>;
}

function FilterBubbleTextInput(props: {
    text: string;
    onChange: (data: { text: string }) => void;
}) {
    const [measurements, ref] = useMeasure<HTMLSpanElement>();

    return (
        <>
            <input
                type="text"
                value={props.text}
                style={{
                    maxWidth: `calc(${measurements?.width ?? 0}px + 1em)`,
                }}
                onChange={(ev) => props.onChange({ text: ev.target.value })}
            ></input>
            {
                // we have to do a hidden measurement element because this is not monospace font,
                // and strings such as "iiiii" and "mmmmm" have drastically different width
                <span ref={ref} className={Css.measure}>
                    {props.text}
                </span>
            }
        </>
    );
}

type FilterBubbleInputComponent<K extends Search.FilterKey> = React.FC<
    Search.FilterData[K] & {
        onChange: (data: Search.FilterData[K]) => void;
    }
>;

const FilterBubbleInput: {
    [K in Search.FilterKey]: FilterBubbleInputComponent<K>;
} = {
    [Search.FilterKey.Department]: FilterBubbleTextInput,
    [Search.FilterKey.Instructor]: FilterBubbleTextInput,
    [Search.FilterKey.Description]: FilterBubbleTextInput,
    [Search.FilterKey.CourseCode]: FilterBubbleTextInput,
    [Search.FilterKey.Title]: FilterBubbleTextInput,
    [Search.FilterKey.ScheduleDays]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.MeetingTime]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.CourseArea]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.Campus]: FilterBubbleInputUnimplemented,
};
