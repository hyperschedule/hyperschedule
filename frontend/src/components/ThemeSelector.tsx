import * as Css from "./ThemeSelector.module.css";
import * as Feather from "react-feather";

export default function ThemeSelector(props: {
    dark: boolean;
    setDark: (dark: boolean) => void;
}): JSX.Element {
    return (
        <button
            className={Css.container}
            onClick={() => props.setDark(!props.dark)}
        >
            <div className={props.dark ? Css.knob : Css.knobDark}>
                <Feather.Sun className={Css.iconSun} size={20} />
                <Feather.Moon className={Css.iconMoon} size={20} />
            </div>
        </button>
    );
}
