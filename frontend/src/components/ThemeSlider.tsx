import Css from "./ThemeSlider.module.css";
import * as Feather from "react-feather";

import useStore, { Theme } from "@hooks/store";

export default function ThemeSlider(): JSX.Element {
    const theme = useStore((store) => store.theme);
    const toggleTheme = useStore((store) => store.toggleTheme);

    const isDark = theme === Theme.Dark;
    return (
        <button className={Css.container} onClick={toggleTheme}>
            <div className={isDark ? Css.knobDark : Css.knob}>
                <Feather.Sun className={Css.iconSun} size={20} />
                <Feather.Moon className={Css.iconMoon} size={20} />
            </div>
        </button>
    );
}
