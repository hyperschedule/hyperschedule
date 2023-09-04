import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React from "react";
import { useMeasure } from "@react-hookz/web";
import * as Feather from "react-feather";

import { useCourseAreaDescription } from "@hooks/api/course";

type FilterBubbleComponentProps<Data> = {
    onChange: (data: Data | null) => void;
    onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
    focusNext: () => void;
};
type FilterBubbleComponent<K extends Search.FilterKey> = React.FC<
    FilterBubbleComponentProps<Search.FilterData[K]>
>;

const FilterBubbleInput: {
    [K in Search.FilterKey]: FilterBubbleComponent<K>;
} = {
    [Search.FilterKey.Department]: FilterBubbleTextInput,
    [Search.FilterKey.Instructor]: FilterBubbleTextInput,
    [Search.FilterKey.Description]: FilterBubbleTextInput,
    [Search.FilterKey.CourseCode]: FilterBubbleTextInput,
    [Search.FilterKey.Title]: FilterBubbleTextInput,
    [Search.FilterKey.ScheduleDays]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.MeetingTime]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.CourseArea](props) {
        const result = useCourseAreaDescription();
        const descriptions = result.data ?? new Map<string, never>();

        const [selectedArea, setSelectedArea] = React.useState<string | null>(
            null,
        );
        const [text, setText] = React.useState("");

        const inputRef = React.useRef<HTMLInputElement>(null);
        const [focus, setFocus] = React.useState(false);

        const [selectIndex, setSelectIndex] = React.useState(0);

        const updateFocus = () =>
            setFocus(document.activeElement === inputRef.current);

        React.useEffect(updateFocus, [document.activeElement, inputRef]);

        const matchedAreaDescriptions = React.useMemo(() => {
            const matched: { area: string; description: string }[] = [];
            const tokens = text.toLocaleLowerCase().split(/\s+/);

            for (const [area, description] of descriptions.entries()) {
                if (
                    !tokens.every((token) =>
                        description.toLocaleLowerCase().includes(token),
                    )
                )
                    continue;
                matched.push({ area, description });
            }

            // fun fact: levenshtein edit distance is equivalent to length
            // (in the case that we are filtering candidates by substring include)
            return matched.sort(
                (a, b) => a.description.length - b.description.length,
            );
        }, [descriptions, text]);

        const selectedDescription = selectedArea
            ? descriptions.get(selectedArea)
            : undefined;

        return (
            <div
                className={Css.courseArea}
                data-focus={focus || undefined}
                data-selected={selectedArea}
            >
                <input
                    ref={inputRef}
                    size={8}
                    value={focus ? text : selectedDescription ?? text}
                    onChange={(ev) => {
                        setText(ev.target.value);
                        setSelectIndex(0);
                    }}
                    className={Css.input}
                    onKeyDown={(ev) => {
                        switch (ev.code) {
                            case "ArrowUp":
                                setSelectIndex(Math.max(selectIndex - 1, 0));
                                return;
                            case "ArrowDown":
                                setSelectIndex(
                                    Math.min(
                                        selectIndex + 1,
                                        matchedAreaDescriptions.length - 1,
                                    ),
                                );
                                return;
                            case "Enter":
                                props.focusNext();
                        }

                        props.onKeyDown(ev);
                    }}
                    onFocus={updateFocus}
                    onBlur={() => {
                        const entry = matchedAreaDescriptions[selectIndex];
                        if (!entry) {
                            setSelectedArea(null);
                            props.onChange(null);
                        } else {
                            setText(entry.description);
                            setSelectedArea(entry.area);
                            props.onChange({ area: entry.area });
                        }
                        updateFocus();
                    }}
                />
                <div className={Css.dropdown}>
                    {matchedAreaDescriptions.map(
                        ({ area, description }, index) => {
                            return (
                                <div
                                    key={area}
                                    className={Css.item}
                                    data-highlight={
                                        index === selectIndex || undefined
                                    }
                                >
                                    {description}
                                </div>
                            );
                        },
                    )}
                </div>
            </div>
        );
    },
    [Search.FilterKey.Campus]: FilterBubbleInputUnimplemented,
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

function FilterBubbleInputUnimplemented() {
    return <>?</>;
}

function FilterBubbleTextInput(
    props: FilterBubbleComponentProps<{
        text: string;
    }>,
) {
    const [text, setText] = React.useState("");
    return (
        <div className={Css.sizer}>
            <input
                type="text"
                size={1}
                className={Css.input}
                value={text}
                onChange={(ev) => {
                    setText(ev.target.value);
                    props.onChange({ text: ev.target.value });
                }}
                onKeyDown={props.onKeyDown}
            />
            <span className={Css.mirror}>{text}</span>
        </div>
    );
}
