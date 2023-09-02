import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React from "react";
import { useMeasure } from "@react-hookz/web";
import * as Feather from "react-feather";

type FilterBubbleCommonProps<Data> = {
    onChange: (data: Data) => void;
    onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
};

type FilterBubbleComponentProps<Data> = Data & FilterBubbleCommonProps<Data>;

// this is easier than trying to fill the generic for ForwardRefExoticComponent
type ForwardedRefType<Props> = ReturnType<
    typeof React.forwardRef<HTMLInputElement, Props>
>;

const FilterBubbleInput: {
    [K in Search.FilterKey]: ForwardedRefType<
        FilterBubbleComponentProps<Search.FilterData[K]>
    >;
} = {
    [Search.FilterKey.Department]: React.forwardRef(FilterBubbleTextInput),
    [Search.FilterKey.Instructor]: React.forwardRef(FilterBubbleTextInput),
    [Search.FilterKey.Description]: React.forwardRef(FilterBubbleTextInput),
    [Search.FilterKey.CourseCode]: React.forwardRef(FilterBubbleTextInput),
    [Search.FilterKey.Title]: React.forwardRef(FilterBubbleTextInput),
    [Search.FilterKey.ScheduleDays]: React.forwardRef(
        FilterBubbleInputUnimplemented,
    ),
    [Search.FilterKey.MeetingTime]: React.forwardRef(
        FilterBubbleInputUnimplemented,
    ),
    [Search.FilterKey.CourseArea]: React.forwardRef(
        FilterBubbleInputUnimplemented,
    ),
    [Search.FilterKey.Campus]: React.forwardRef(FilterBubbleInputUnimplemented),
};

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
    const InputComponent = FilterBubbleInput[props.filter.key] as React.FC<
        FilterBubbleComponentProps<Search.FilterData[Search.FilterKey]> & {
            ref: React.Ref<HTMLInputElement>;
        }
    >;

    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className={Css.bubble}>
            <span className={Css.filterKey}>{props.filter.key}</span>
            <span className={Css.filterData}>
                <InputComponent
                    {...props.filter.data}
                    onChange={(data) => {
                        setSearchFilter(props.index, {
                            key: props.filter.key,
                            data,
                        } as Search.Filter);
                    }}
                    onKeyDown={(ev) => {
                        const el = inputRef.current;
                        if (el === null) return;
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
                            if (inputRef.current?.value.length === 0) {
                                removeSearchFilter(props.index);
                                props.focusOnFilter(props.index + 1, 0);
                            }
                        }
                    }}
                    ref={inputRef}
                />
                <Feather.X
                    className={Css.closeIcon}
                    onClick={() => removeSearchFilter(props.index)}
                />
            </span>
        </div>
    );
}

function FilterBubbleInputUnimplemented() {
    return <>?</>;
}

function FilterBubbleTextInput(
    props: FilterBubbleComponentProps<{
        text: string;
    }>,
    ref: React.Ref<HTMLInputElement>,
) {
    const [measurements, measurementsRef] = useMeasure<HTMLSpanElement>();

    return (
        <>
            <input
                type="text"
                value={props.text}
                style={{
                    maxWidth: `calc(${measurements?.width ?? 0}px + 1em)`,
                }}
                onChange={(ev) => props.onChange({ text: ev.target.value })}
                onKeyDown={props.onKeyDown}
                ref={ref}
            ></input>
            {
                // we have to do a hidden measurement element because this is not monospace font,
                // and strings such as "iiiii" and "mmmmm" have drastically different width
                <span ref={measurementsRef} className={Css.measure}>
                    {props.text}
                </span>
            }
        </>
    );
}
