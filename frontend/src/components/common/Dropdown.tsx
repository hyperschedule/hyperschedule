import Css from "./Dropdown.module.css";
import * as Feather from "react-feather";
export default function Dropdown(props: {
    choices: string[];
    selected: string;
    onSelect: (selected: number) => void;
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
                    <option value="" disabled>
                        (nothing)
                    </option>
                </select>

                <Feather.ChevronDown className={Css.downArrow} />
            </div>
        </div>
    );
}
