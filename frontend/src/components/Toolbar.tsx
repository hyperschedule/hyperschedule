import { useUserStore } from "@hooks/store/user";

import Css from "./Toolbar.module.css";
import AppCss from "@components/App.module.css";

import * as Feather from "react-feather";
import useStore from "@hooks/store";
import { PopupOption } from "@lib/popup";
import classNames from "classnames";

export default function Toolbar() {
    const setPopup = useStore((store) => store.setPopup);

    const loggedIn = useUserStore((user) => user.server) !== null;
    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);

    return (
        <div className={Css.toolbar}>
            {loggedIn ? (
                <button
                    className={classNames(
                        AppCss.defaultButton,
                        Css.button,
                        Css.exportButton,
                    )}
                >
                    Export calendar
                </button>
            ) : (
                <></>
            )}
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.button,
                    Css.aboutButton,
                    Css.iconOnlyButton,
                )}
            >
                <Feather.Info className={Css.icon} />
            </button>

            {loggedIn || confirmedGuest ? (
                <>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.iconOnlyButton,
                            Css.button,
                            Css.settingsButton,
                        )}
                        onClick={() =>
                            setPopup({
                                option: PopupOption.Settings,
                            })
                        }
                    >
                        <Feather.Settings className={Css.icon} />
                    </button>
                </>
            ) : (
                <>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.button,
                            Css.loginButton,
                        )}
                        onClick={() => setPopup({ option: PopupOption.Login })}
                    >
                        Login
                        <Feather.User className={AppCss.defaultButtonIcon} />
                    </button>
                </>
            )}
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.iconOnlyButton,
                    Css.button,
                    Css.githubButton,
                )}
            >
                <Feather.GitHub className={Css.icon} />
            </button>
        </div>
    );
}
