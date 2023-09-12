import Css from "./Dropdown.module.css";
import * as Feather from "react-feather";
export default function Dropdown(props: {
    choices: string[];
    selected: string;
    onSelect: (selected: string) => void;
}) {
    return (
        <div className={Css.dropdown}>
            <div className={Css.select}>
                <select
                    value={props.selected}
                    onChange={(ev) => props.onSelect(ev.target.value)}
                >
                    {props.choices.map((s) => (
                        <option value={s} key={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <Feather.ChevronDown className={Css.downArrow} />
            </div>
        </div>
    );
}
