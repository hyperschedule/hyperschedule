import Css from "./PopupAlternativeLine.module.css";
import classNames from "classnames";

export default function PopupAlternativeLine(props: {
    left: JSX.Element;
    right: JSX.Element;
    className?: string;
}) {
    return (
        <div className={classNames(Css.alternativeContainer, props.className)}>
            {props.left}
            <div className={Css.line}>
                <span className={Css.text}>OR</span>
            </div>
            {props.right}
        </div>
    );
}
