import useStore, { PopupOption } from "@hooks/store";
import Css from "./Popup.module.css";
import * as Feather from "react-feather";
import Login from "./Login";
import SectionDetails from "@components/popup/SectionDetails";

function PopupBox(props: { children: JSX.Element }): JSX.Element {
    const setPopup = useStore((store) => store.setPopup);

    function dismissPopup() {
        setPopup(null);
    }

    return (
        <div className={Css.popupBackground}>
            <div className={Css.popupBox}>
                <button className={Css.closeButton} onClick={dismissPopup}>
                    <Feather.X size={24} />
                </button>
                <div className={Css.popupContent}>{props.children}</div>
            </div>
        </div>
    );
}

export default function Popup() {
    const popup = useStore((store) => store.popup);
    if (popup === null) return <></>;
    switch (popup.option) {
        case PopupOption.Login:
            return (
                <PopupBox>
                    <Login />
                </PopupBox>
            );
        case PopupOption.SectionDetail:
            return (
                <PopupBox>
                    <SectionDetails section={popup.section} />
                </PopupBox>
            );
        default:
            return <></>;
    }
}
