import { useUserStore } from "@hooks/store/user";

import Css from "./Toolbar.module.css";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

import * as Feather from "react-feather";

export default function Toolbar() {
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
