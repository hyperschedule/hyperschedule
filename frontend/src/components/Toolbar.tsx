import { useUserStore } from "@hooks/store/user";

import Css from "./Toolbar.module.css";
import AppCss from "@components/App.module.css";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

import * as Feather from "react-feather";
import useStore from "@hooks/store";
import { PopupOption } from "@lib/popup";

export default function Toolbar() {
    const setPopup = useStore((store) => store.setPopup);

    const loggedIn = useUserStore((user) => user.server);

    function loginThroughCAS() {
        window.location.href = `${__API_URL__}/auth/saml`;
    }

    const user = useUserStore();

    return (
        <div className={Css.toolbar}>
            {user.activeTerm.term === CURRENT_TERM.term &&
            user.activeTerm.year ===
                CURRENT_TERM.year ? null /*<button onClick={() => legacyImport.mutate()}>
                    Import from legacy
                </button>*/ : (
                <></>
            )}
            <button>Report issues</button>
            <button>Export calendar</button>
            <Feather.GitHub />

            <button
                className={AppCss.defaultButton}
                onClick={() =>
                    setPopup({
                        option: PopupOption.Settings,
                    })
                }
            >
                <Feather.Settings className={AppCss.defaultButtonIcon} />
            </button>

            {loggedIn ? (
                "logged in"
            ) : (
                <>
                    guest
                    <button onClick={loginThroughCAS}>Login</button>
                </>
            )}
        </div>
    );
}
