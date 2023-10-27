import * as Search from "@lib/search";
import React from "react";
import Css from "./FilterBubble.module.css";
import classNames from "classnames";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import { memo } from "react";

export const TimeFilterBubble = memo(createRangeFilterBubble(parseTimeExp, 1));
export const CreditFilterBubble = memo(
    createRangeFilterBubble(parseCreditExp, 0.0001),
);

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

const creditRegex = /^\d?(\.\d{1,4})?$/;

function parseCreditExp(value: string): number | null {
    if (value === "") return null;
    const match = value.match(creditRegex);
    if (match === null) return null;

    const n = parseFloat(value);
    // this really shouldn't happen because of the regex but we still check just in case
    if (Number.isNaN(n)) return null;

    return n;
}

function createRangeFilterBubble(
    parseValueFunc: (value: string) => number | null,
    epsilon: number,
) {
    return function (props: FilterBubbleComponentProps<Search.RangeFilter>) {
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
                            parseValueFunc,
                        );
                        if (exp !== null) {
                            if (exp.type === "range") {
                                if (exp.end >= exp.start) {
                                    props.onChange({
                                        start: exp.start,
                                        end: exp.end,
                                    });
                                    setValid(true);
                                    setCompleted(true);
                                    return;
                                }
                            } else {
                                const filter: Search.RangeFilter = {
                                    start: null,
                                    end: null,
                                };

                                switch (exp.op) {
                                    case Search.CompOperator.GreaterThan:
                                        filter.start = exp.value + epsilon;
                                        break;
                                    case Search.CompOperator.LessThan:
                                        filter.end = exp.value - epsilon;
                                        break;
                                    case Search.CompOperator.AtLeast:
                                        filter.start = exp.value;
                                        break;
                                    case Search.CompOperator.AtMost:
                                        filter.end = exp.value;
                                        break;
                                    case Search.CompOperator.Equal:
                                        filter.start = exp.value;
                                        filter.end = exp.value;
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
    };
}
