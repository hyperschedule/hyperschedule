import * as Css from "./ThemeSlider.module.css";
import * as Feather from "react-feather";

export const enum Theme {
    Light,
    Dark,
}

export default function ThemeSlider(props: {
    theme: Theme;
    setTheme: (dark: Theme) => void;
}): JSX.Element {
    const isDark = props.theme === Theme.Dark;
    return (
        <button
            className={Css.container}
            onClick={() => props.setTheme(isDark ? Theme.Light : Theme.Dark)}
        >
            <div className={isDark ? Css.knobDark : Css.knob}>
                <Feather.Sun className={Css.iconSun} size={20} />
                <Feather.Moon className={Css.iconMoon} size={20} />
            </div>
        </button>
    );
}
