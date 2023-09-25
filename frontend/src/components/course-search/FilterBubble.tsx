import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";
import useStore from "@hooks/store";
import React, { useState } from "react";
import * as Feather from "react-feather";
import * as APIv4 from "hyperschedule-shared/api/v4";
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
    [Search.FilterKey.MeetingTime]: TimeFilterBubble,
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

const timeRegex =
    /^(?<hour>\d{1,2})(?::(?<minute>[0-5][0-9]))?\s*(?<ampm>am|pm)?$/i;

function parseTimeExp(value: string): number | null {
    const match = value.match(timeRegex);
    if (match === null) return null;
    const groups = match.groups as {
        hour: string;
        minute?: string;
        ampm?: string;
    };

    const hour = parseInt(groups.hour, 10);
    const minute = parseInt(groups.minute ?? "0", 10);
    const ampm = groups.ampm;

    if (minute > 59) return null;
    if (ampm !== undefined) {
        switch (ampm.toLocaleLowerCase()) {
            case "am":
                if (hour > 12) return null;
                return (hour % 12) * 3600 + minute * 60;
            case "pm":
                if (hour > 12) return null;
                return ((hour % 12) + 12) * 3600 + minute * 60;
        }
    }
    if (hour > 23) return null;
    return hour * 3600 + minute * 60;
}

function TimeFilterBubble(
    props: FilterBubbleComponentProps<Search.TimeFilter>,
) {
    const [text, setText] = React.useState("");
    const [valid, setValid] = React.useState(false);
    // we don't want to flag an error until at least one valid filter has been entered
    const [completed, setCompleted] = React.useState(false);

    return (
        <div className={Css.sizer}>
            <input
                type="text"
                size={1}
                className={classNames(Css.input, {
                    [Css.invalid]: completed && !valid,
                })}
                value={text}
                onChange={(ev) => {
                    setText(ev.target.value);
                    if (ev.target.value === "") {
                        props.onChange(null);
                        return;
                    }

                    const exp = Search.parseRangeExp(
                        ev.target.value,
                        parseTimeExp,
                    );
                    if (exp !== null) {
                        if (exp.type === "range") {
                            if (exp.end >= exp.start) {
                                props.onChange({
                                    startTime: exp.start,
                                    endTime: exp.end,
                                });
                                setValid(true);
                                setCompleted(true);
                                return;
                            }
                        } else {
                            const filter: Search.TimeFilter = {
                                startTime: null,
                                endTime: null,
                            };

                            switch (exp.op) {
                                case Search.CompOperator.GreaterThan:
                                    filter.startTime = exp.value + 1;
                                    break;
                                case Search.CompOperator.LessThan:
                                    filter.endTime = exp.value - 1;
                                    break;
                                case Search.CompOperator.AtLeast:
                                    filter.startTime = exp.value;
                                    break;
                                case Search.CompOperator.AtMost:
                                    filter.endTime = exp.value;
                                    break;
                                case Search.CompOperator.Equal:
                                    filter.startTime = exp.value;
                                    filter.endTime = exp.value;
                                    break;
                            }
                            props.onChange(filter);
                            setValid(true);
                            setCompleted(true);
                            return;
                        }
                    }
                    setValid(false);
                }}
                onKeyDown={props.onKeyDown}
                onBlur={() => setCompleted(true)}
            />
            <span className={Css.mirror}>{text}</span>
        </div>
    );
}

function FilterBubbleInputUnimplemented() {
    return <>?</>;
}

function FilterBubbleTextInput(
    props: FilterBubbleComponentProps<Search.TextFilter>,
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

function AutoComplete(props: {
    onSelect: (index: number) => void;
    onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
    choices: string[];
    render: React.FC<{ index: number }>;
}) {
    const [text, setText] = React.useState("");
    const [hasFocus, setHasFocus] = React.useState(false);
    const [selectIndex, setSelectIndex] = React.useState(0);
    const [valid, setValid] = useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    function recomputeFocus() {
        setHasFocus(document.activeElement === inputRef.current);
    }

    React.useEffect(recomputeFocus, [document.activeElement, inputRef]);

    function setActive(index: number) {
        setSelectIndex(index);
        // css nth-child is 1-indexed
        document
            .querySelector(`.${Css.autocompleteItem}:nth-child(${index + 1})`)!
            .scrollIntoView({ block: "end", inline: "end" });
    }

    const filteredChoices = React.useMemo(() => {
        const matched: { choice: string; originalIndex: number }[] = [];
        const tokens = text.toLocaleLowerCase().split(/\s+/);

        for (let i = 0; i < props.choices.length; ++i) {
            if (
                !tokens.every((token) =>
                    props.choices[i]!.toLocaleLowerCase().includes(token),
                )
            )
                continue;
            matched.push({ choice: props.choices[i]!, originalIndex: i });
        }

        // fun fact: levenshtein edit distance is equivalent to length
        // (in the case that we are filtering candidates by substring include)
        matched.sort((a, b) => a.choice.length - b.choice.length);

        return matched;
    }, [props.choices, text]);

    return (
        <div
            className={Css.autocomplete}
            data-focus={hasFocus || undefined}
            data-isvalid={valid || undefined}
        >
            <div className={Css.sizer}>
                <input
                    ref={inputRef}
                    size={1}
                    value={
                        hasFocus || !valid
                            ? text
                            : filteredChoices[selectIndex]?.choice ?? text
                    }
                    onChange={(ev) => {
                        setText(ev.target.value);
                        setValid(false);
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
                                        props.choices.length - 1,
                                    ),
                                );
                                return;
                            case "Tab":
                            case "Enter":
                                const selected = filteredChoices[selectIndex];
                                if (selected === undefined) return;
                                setText(selected.choice);
                                setValid(true);
                                props.onSelect(selected.originalIndex);
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
                        const selected = filteredChoices[selectIndex];
                        if (
                            selected !== undefined &&
                            text.toLocaleLowerCase() ===
                                selected.choice.toLocaleLowerCase()
                        ) {
                            // accept the filter if someone types the identical area, then clicks away (or press right arrow)
                            props.onSelect(selected.originalIndex);
                            setSelectIndex(0);
                            setValid(true);
                        }
                        recomputeFocus();
                    }}
                />
                <span className={Css.mirror}>{text}</span>
            </div>
            <div className={Css.dropdown} ref={dropdownRef}>
                {filteredChoices.map((choice, index) => {
                    return (
                        <div
                            key={choice.choice}
                            className={Css.autocompleteItem}
                            data-highlight={index === selectIndex || undefined}
                            onPointerEnter={
                                // we don't need to use setActive because we don't need to scroll
                                () => setSelectIndex(index)
                            }
                            onPointerDown={
                                // prevent default so it doesn't trigger a blur
                                // (otherwise this dropdown would be deleted before click
                                // and you can never click on it
                                (ev) => ev.preventDefault()
                            }
                            onClick={() => {
                                setText(choice.choice);
                                setValid(true);
                                props.onSelect(choice.originalIndex);
                                setSelectIndex(0);
                            }}
                        >
                            <props.render index={choice.originalIndex} />
                        </div>
                    );
                })}
            </div>
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
}

function CampusBubble(props: FilterBubbleComponentProps<Search.CampusFilter>) {
    const activeSections = useActiveSectionsQuery().data;
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
}
