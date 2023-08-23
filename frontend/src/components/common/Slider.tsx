import Css from "./Slider.module.css";
import type { MouseEventHandler, CSSProperties } from "react";

export default function Slider(props: {
    value: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    colorLeft: string;
    colorRight: string;
}): JSX.Element {
    return (
        <button
            className={Css.container}
            onClick={props.onClick}
            style={
                {
                    "--color-left": props.colorLeft,
                    "--color-right": props.colorRight,
                } as CSSProperties
            }
        >
            <div className={props.value ? Css.left : Css.right}>
                <span className={Css.iconLeft} />
                <span className={Css.iconRight} />
            </div>
        </button>
    );
}
