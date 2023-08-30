import Css from "./Dropdown.module.css";

export default function Dropdown(props: {
    choices: string[];
    selected: string;
    onSelect: (selected: string) => void;
}) {
    return (
        <div className={Css.dropdown}>
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
        </div>
    );
}
