import Css from "./Slider.module.css";

export default function Slider(props: {
    value: boolean;
    onToggle: () => void;
    text: string;
}): JSX.Element {
    return (
        <div className={Css.container}>
            <span>{props.text}</span>
            <label className={Css.label}>
                <input
                    type="checkbox"
                    onChange={props.onToggle}
                    checked={props.value}
                    className={Css.input}
                />
                <div className={Css.spacer} />
                <div className={Css.knob} />
            </label>
        </div>
    );
}
