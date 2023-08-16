import useStore, { PopupOption } from "@hooks/store";
import Css from "./Popup.module.css";
import * as Feather from "react-feather";
import Login from "./Login";
import SectionDetails from "@components/popup/SectionDetails";

function PopupBox(props: { inner: JSX.Element }): JSX.Element {
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
                <div className={Css.popupContent}>{props.inner}</div>
            </div>
        </div>
    );
}

export default function (): JSX.Element {
    const popup = useStore((store) => store.popup);
    if (popup === null) return <></>;
    switch (popup.option) {
        case PopupOption.Login:
            return <PopupBox inner={<Login />} />;
        case PopupOption.SectionDetail:
            return (
                <PopupBox inner={<SectionDetails section={popup.section} />} />
            );
        default:
            return <></>;
    }
}
