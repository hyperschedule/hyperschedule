import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React, { useState } from "react";
import * as Feather from "react-feather";

import { useCourseAreaDescription } from "@hooks/api/course";
import classNames from "classnames";
import { useActiveSectionsQuery } from "@hooks/section";

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
    [Search.FilterKey.CourseArea]: CourseAreaBubble,
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
    const [timer, setTimer] = useState<number | undefined>(undefined);

    return (
        <div className={Css.sizer}>
            <input
                type="text"
                size={1}
                className={Css.input}
                value={text}
                onChange={(ev) => {
                    setText(ev.target.value);
                    clearTimeout(timer);
                    setTimer(
                        setTimeout(
                            () => props.onChange({ text: ev.target.value }),
                            150,
                        ),
                    );
                }}
                onKeyDown={props.onKeyDown}
            />
            <span className={Css.mirror}>{text}</span>
        </div>
    );
}

const campusCss = [
    // this is ordered by the year the school is established
    Css.pom,
    Css.scr,
    Css.cmc,
    Css.hmc,
    Css.ptz,
];

function CourseAreaBubble(
    props: FilterBubbleComponentProps<{
        area: string;
    }>,
) {
    const courseAreaDescription = useCourseAreaDescription();
    const activeSections = useActiveSectionsQuery().data;

    const relevantAreas: Map<string, string> = React.useMemo(() => {
        // not all areas exist in a semester
        const descriptions = courseAreaDescription.data;
        if (descriptions === undefined) return new Map();
        if (activeSections === undefined) return new Map();
        const areas = new Map<string, string>();
        for (const s of activeSections)
            for (const a of s.courseAreas) {
                const desc = descriptions.get(a);
                if (desc) areas.set(a, desc);
            }

        return areas;
    }, [activeSections]);

    const [selectedArea, setSelectedArea] = React.useState<string | null>(null);
    const [text, setText] = React.useState("");

    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [hasFocus, setHasFocus] = React.useState(false);

    const [selectIndex, setSelectIndex] = React.useState(0);

    function recomputeFocus() {
        setHasFocus(document.activeElement === inputRef.current);
    }

    React.useEffect(recomputeFocus, [document.activeElement, inputRef]);

    function setActive(index: number) {
        setSelectIndex(index);
        // css nth-child is 1-indexed
        document
            .querySelector(`.${Css.item}:nth-child(${index + 1})`)!
            .scrollIntoView(false);
    }

    const matchedAreaDescriptions = React.useMemo(() => {
        const matched: { area: string; description: string }[] = [];
        const tokens = text.toLocaleLowerCase().split(/\s+/);

        for (const [area, description] of relevantAreas.entries()) {
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
    }, [relevantAreas, text]);

    const selectedDescription = selectedArea
        ? relevantAreas.get(selectedArea)
        : undefined;

    return (
        <div
            className={Css.courseArea}
            data-focus={hasFocus || undefined}
            data-selected={selectedArea}
        >
            <div className={Css.sizer}>
                <input
                    ref={inputRef}
                    size={1}
                    value={hasFocus ? text : selectedDescription ?? text}
                    onChange={(ev) => {
                        setText(ev.target.value);
                        setSelectedArea(null);
                        setSelectIndex(0);
                    }}
                    className={Css.input}
                    onKeyDown={(ev) => {
                        switch (ev.code) {
                            case "ArrowUp":
                                setActive(Math.max(selectIndex - 1, 0));
                                return;
                            case "ArrowDown":
                                setActive(
                                    Math.min(
                                        selectIndex + 1,
                                        matchedAreaDescriptions.length - 1,
                                    ),
                                );
                                return;
                            case "Tab":
                            case "Enter":
                                const selected =
                                    matchedAreaDescriptions[selectIndex];
                                if (selected === undefined) return;
                                setText(selected.description);
                                setSelectedArea(selected.area);
                                props.onChange({ area: selected.area });
                                props.focusNext();
                                if (ev.code === "Tab")
                                    // tab by default focuses the next element
                                    ev.preventDefault();
                                return;
                            default:
                                props.onKeyDown(ev);
                        }
                    }}
                    onFocus={recomputeFocus}
                    onBlur={() => {
                        const selected = matchedAreaDescriptions[selectIndex];
                        if (
                            selected !== undefined &&
                            text.toLocaleLowerCase() ===
                                selected.description.toLocaleLowerCase()
                        ) {
                            // accept the filter if someone types the identical area, then clicks away (or press right arrow)
                            setSelectedArea(selected.area);
                            props.onChange({ area: selected.area });
                        }
                        recomputeFocus();
                    }}
                />
                <span className={Css.mirror}>{text}</span>
            </div>
            <div className={Css.dropdown} ref={dropdownRef}>
                {matchedAreaDescriptions.map(({ area, description }, index) => {
                    const campus = area.charCodeAt(0) - 48 - 1; // 48 is the ascii code for '0'

                    return (
                        <div
                            key={area}
                            className={Css.item}
                            data-highlight={index === selectIndex || undefined}
                        >
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
