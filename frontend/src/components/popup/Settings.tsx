import Css from "./Settings.module.css";
import AppCss from "@components/App.module.css";
import Slider from "@components/common/Slider";
import useStore from "@hooks/store";
import { AUTH_COOKIE_DOMAIN, DATA_VIEWER_PATH } from "@lib/constants";
import { AUTH_TOKEN_COOKIE_NAME } from "hyperschedule-shared/api/constants";
import * as Feather from "react-feather";
import classNames from "classnames";
import { useUserStore } from "@hooks/store/user";
import Cookies from "js-cookie";

export function Settings() {
    return (
        <div className={Css.settings}>
            <h2 className={Css.title}>Settings</h2>
            <AppearanceSettings />
            <AccountSettings />
            <DataViewer />
        </div>
    );
}

function logoutLocal() {
    useUserStore.persist.clearStorage();
    window.location.reload();
}

function logout() {
    Cookies.remove(AUTH_TOKEN_COOKIE_NAME, {
        path: "",
        domain: AUTH_COOKIE_DOMAIN,
    });
    logoutLocal();
}

function AccountSettings() {
    const serverData = useUserStore((store) => store.server);

    return (
        <div className={Css.account}>
            <h3 className={Css.title}>Account</h3>
            {serverData === null ? (
                <>
                    <p>You are currently using a local guest account.</p>
                </>
            ) : (
                <></>
            )}
            <button onClick={serverData === null ? logoutLocal : logout}>
                Log out
            </button>
        </div>
    );
}

function DataViewer() {
    return (
        <div>
            <h3 className={Css.title}>Data</h3>
            <p>
                You can view all the data about you stored on this site and on
                the server in the data viewer.
            </p>
            <button
                className={classNames(AppCss.defaultButton, Css.button)}
                onClick={() => window.open(DATA_VIEWER_PATH, "_blank")}
            >
                <Feather.Search className={AppCss.defaultButtonIcon} />
                Open data viewer
            </button>
        </div>
    );
}

function AppearanceSettings() {
    const options = useStore((store) => store.appearanceOptions);
    const setOptions = useStore((store) => store.setAppearanceOptions);
    return (
        <div className={Css.appearance}>
            <h3 className={Css.title}>Appearance</h3>
            <span>Disable Shadows</span>
            <Slider
                value={options.disableShadows}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableShadows: !options.disableShadows,
                    })
                }
                text=""
            />
            <span>Disable Transparency</span>
            <Slider
                value={options.disableTransparency}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableTransparency: !options.disableTransparency,
                    })
                }
                text=""
            />
            <span>Disable Rounded Corners</span>
            <Slider
                value={options.disableRoundedCorners}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableRoundedCorners: !options.disableRoundedCorners,
                    })
                }
                text=""
            />
        </div>
    );
}
