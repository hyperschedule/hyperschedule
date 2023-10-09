import type * as Search from "@lib/search";
import React, { useState } from "react";
import Css from "./FilterBubble.module.css";
import type { FilterBubbleComponentProps } from "./FilterBubble";

export default function FilterBubbleTextInput(
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
