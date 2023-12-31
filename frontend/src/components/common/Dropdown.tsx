import Css from "./Dropdown.module.css";
import * as Feather from "react-feather";
export default function Dropdown(props: {
    choices: (string | number)[];
    selected: string | number;
    onSelect: (selected: number) => void;
    emptyPlaceholder: string | number;
}) {
    return (
        <div className={Css.dropdown}>
            <div className={Css.select}>
                <select
                    value={props.selected}
                    onChange={(ev) => props.onSelect(ev.target.selectedIndex)}
                >
                    {props.choices.map((s, i) => (
                        <option value={s} key={i}>
                            {s}
                        </option>
                    ))}
                    {props.selected === "" ? (
                        <option value="" disabled>
                            ({props.emptyPlaceholder})
                        </option>
                    ) : (
                        <></>
                    )}
                </select>

                <Feather.ChevronDown className={Css.downArrow} />
            </div>
        </div>
    );
}
