import type * as Search from "@lib/search";
import React, { useState } from "react";
import Css from "./FilterBubble.module.css";
import type { FilterBubbleComponentProps } from "./FilterBubble";
import classNames from "classnames";
import { dayOrder } from "@lib/schedule";

export function createTextInputBubble(validator: (value: string) => boolean) {
    return function TextInputBubble(
        props: FilterBubbleComponentProps<Search.TextFilter>,
    ) {
        const [text, setText] = React.useState("");
        const [timer, setTimer] = useState<number | undefined>(undefined);
        const [valid, setValid] = useState<boolean>(true);

        return (
            <div className={Css.sizer}>
                <input
                    type="text"
                    size={1}
                    className={classNames(Css.input, { [Css.invalid]: !valid })}
                    value={text}
                    onChange={(ev) => {
                        setText(ev.target.value);
                        clearTimeout(timer);

                        if (validator(ev.target.value)) {
                            setValid(true);
                            setTimer(
                                setTimeout(
                                    () =>
                                        props.onChange({
                                            text: ev.target.value,
                                        }),
                                    150,
                                ),
                            );
                        } else {
                            setValid(false);
                        }
                    }}
                    onKeyDown={props.onKeyDown}
                />
                <span className={Css.mirror}>{text}</span>
            </div>
        );
    };
}

export const TextInputBubble = createTextInputBubble(() => true);

const daysRegex = new RegExp(`^(${[...dayOrder, " "].join("|")})*$`, "i");
export const DaysFilterBubble = createTextInputBubble((value) => {
    if (daysRegex.exec(value) === null) return false;
    const dayString = value.replaceAll(" ", "").toLocaleLowerCase();
    return ![...dayString].some((value, index, arr) =>
        arr.includes(value, index + 1),
    );
});
