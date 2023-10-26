import Css from "./Login.module.css";
import AppCss from "@components/App.module.css";
import PopupAlternativeLine from "./PopupAlternativeLine";
import useStore from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import classNames from "classnames";
import * as Feather from "react-feather";

export default function Login(props: { continuation?: () => void }) {
    const confirm = useUserStore((store) => store.confirmGuest);
    const setPopup = useStore((store) => store.setPopup);

    function loginThroughCAS() {
        window.location.href = `${__API_URL__}/auth/saml`;
    }

    function confirmGuest() {
        confirm();
        setPopup(null);
        props.continuation?.();
    }

    return (
        <div className={Css.loginBox}>
            <PopupAlternativeLine
                left={
                    <div className={classNames(Css.login)}>
                        <p>Member of the Claremont Colleges?</p>
                        <button
                            className={classNames(
                                AppCss.defaultButton,
                                Css.button,
                            )}
                            onClick={loginThroughCAS}
                        >
                            Login with CAS
                        </button>

                        <div className={Css.reasons}>
                            <h4>Your data is stored in The Cloud&trade;</h4>
                            <Feather.Check />
                            <span>Synchronize your data across devices</span>
                            <Feather.Check />
                            <span>
                                Export your calendar directly to Google Calendar
                                or Microsoft Outlook
                            </span>
                            <Feather.Check />
                            <span>
                                Your data will be safe permanently
                                <sup>*</sup>
                            </span>
                        </div>

                        <p className={Css.footnote}>
                            <sup>*</sup>unless ASHMC stopped paying our server
                            bills
                        </p>
                    </div>
                }
                right={
                    <div className={classNames(Css.guest)}>
                        <button
                            className={classNames(
                                AppCss.defaultButton,
                                Css.button,
                            )}
                            onClick={confirmGuest}
                        >
                            Proceed as guest
                        </button>
                        <div className={Css.reasons}>
                            <h4>Your data is stored locally</h4>
                            <Feather.X />
                            <span>Cannot synchronize your data</span>
                            <Feather.X />
                            <span>Cannot export your calendar</span>
                            <Feather.X />
                            <span>
                                You may lose your data if you clear your
                                browsing history
                            </span>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
