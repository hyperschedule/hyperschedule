import React, { useState } from "react";
import Css from "./FilterBubble.module.css";
import { memo } from "react";

export default memo(function AutoComplete(props: {
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
});
