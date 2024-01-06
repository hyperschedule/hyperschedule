import Css from "./Settings.module.css";
import AppCss from "@components/App.module.css";
import Slider from "@components/common/Slider";
import Dropdown from "@components/common/Dropdown";
import useStore from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import {
    AUTH_COOKIE_DOMAIN,
    DATA_VIEWER_PATH,
    GITHUB_LINK,
} from "@lib/constants";
import { AUTH_TOKEN_COOKIE_NAME } from "hyperschedule-shared/api/constants";
import { schoolCodeToName } from "hyperschedule-shared/api/v4";
import * as Feather from "react-feather";
import classNames from "classnames";
import Cookies from "js-cookie";
import { useState } from "react";
import { memo } from "react";
import { useAllTerms } from "@hooks/term";

export const Settings = memo(function Settings() {
    return (
        <div className={Css.settings}>
            <h2 className={Css.title}>Settings</h2>
            <AppearanceSettings />
            <SectionConflictSettings />
            <HistoricalSearchSettings />
            <AccountSettings />
            <DataViewer />
            <ReportIssues />
        </div>
    );
});

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

const AccountSettings = memo(function AccountSettings() {
    const serverData = useUserStore((store) => store.server);

    const [showAccountDetails, setShowAccountDetails] =
        useState<boolean>(false);

    return (
        <div className={Css.account}>
            <h3 className={Css.title}>Account</h3>
            {serverData === null ? (
                <>
                    <p>
                        You are currently using a local guest account. To log in
                        to an account, please log out first.{" "}
                        <span className={Css.caution}>
                            Caution: if you log out, all your data will be
                            deleted.
                        </span>{" "}
                        Please check the data viewer below before proceeding
                        (all persistent user data will be removed).
                    </p>
                </>
            ) : (
                <>
                    <p>You are currently logged in.</p>

                    <div
                        className={classNames(Css.accountDetails, {
                            [Css.show]: showAccountDetails,
                        })}
                    >
                        <span className={Css.userFieldDesc}>
                            Hyperschedule User ID
                        </span>
                        <span className={Css.userFieldValue}>
                            {serverData._id}
                        </span>
                        <span className={Css.userFieldDesc}>
                            CAS Authentication ID
                        </span>
                        <span className={Css.userFieldValue}>
                            {serverData.eppn}
                        </span>
                        <span className={Css.userFieldDesc}>Organization</span>
                        <span className={Css.userFieldValue}>
                            {schoolCodeToName(serverData.school)}
                        </span>
                    </div>
                </>
            )}
            <span className={Css.buttons}>
                {serverData !== null && !showAccountDetails ? (
                    <button
                        className={classNames(AppCss.defaultButton, Css.button)}
                        onClick={() => setShowAccountDetails(true)}
                    >
                        Show account details
                    </button>
                ) : (
                    <></>
                )}

                <button
                    className={classNames(AppCss.defaultButton, Css.button)}
                    onClick={serverData === null ? logoutLocal : logout}
                >
                    Log out
                </button>
            </span>
        </div>
    );
});

const DataViewer = memo(function DataViewer() {
    return (
        <div className={Css.dataViewer}>
            <h3 className={Css.title}>Data</h3>
            <p>
                You can view all the data about you stored on this site and on
                the server in the data viewer.
            </p>
            <a
                className={classNames(AppCss.defaultButton, Css.button)}
                href={DATA_VIEWER_PATH}
                target="_blank"
            >
                <Feather.Search className={AppCss.defaultButtonIcon} />
                Open data viewer
            </a>
        </div>
    );
});

const AppearanceSettings = memo(function AppearanceSettings() {
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
            <span>Disable Animations</span>
            <Slider
                value={options.disableAnimations}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableAnimations: !options.disableAnimations,
                    })
                }
                text=""
            />
        </div>
    );
});

const SectionConflictSettings = memo(function SectionConflictSettings() {
    const conflictingSectionsOptions = useStore(
        (store) => store.conflictingSectionsOptions,
    );
    const setConflictingSectionsOptions = useStore(
        (store) => store.setConflictingSectionsOptions,
    );

    return (
        <div className={Css.sectionConflict}>
            <h3 className={Css.title}>Section Conflict</h3>
            <span>Skip checking sections of selected courses</span>
            <Slider
                value={conflictingSectionsOptions.skipSectionsOfSelectedCourse}
                onToggle={() => {
                    setConflictingSectionsOptions({
                        ...conflictingSectionsOptions,
                        skipSectionsOfSelectedCourse:
                            !conflictingSectionsOptions.skipSectionsOfSelectedCourse,
                    });
                }}
                text=""
            />
            <span>Also hide asynchronous sections</span>
            <Slider
                value={conflictingSectionsOptions.hideAsyncSections}
                onToggle={() => {
                    setConflictingSectionsOptions({
                        ...conflictingSectionsOptions,
                        hideAsyncSections:
                            !conflictingSectionsOptions.hideAsyncSections,
                    });
                }}
                text=""
            />
        </div>
    );
});

const HistoricalSearchSettings = memo(function HistoricalSearchSettings() {
    const historicalSearchOptions = useStore(
        (store) => store.historicalSearchOptions,
    );
    const setHistoricalSearchOptions = useStore(
        (store) => store.setHistoricalSearchOptions,
    );

    const allTerms = useAllTerms() ?? [];
    function createPossibleRanges(numTerms: number): number[] {
        let results = [];
        for (let i = 0; i < Math.log2(numTerms); i++) {
            if (i !== 0) {
                results.push(2 ** i);
            }
        }
        results.push(numTerms);
        return results;
    }
    const rangeOptions = createPossibleRanges(allTerms.length);

    return (
        <div className={Css.historicalSearch}>
            <h3 className={Css.title}>Historical Search</h3>
            <span>
                Search for matching courses from recent terms when only a few
                courses are found
            </span>

            <Slider
                value={historicalSearchOptions.enable}
                onToggle={() => {
                    setHistoricalSearchOptions({
                        ...historicalSearchOptions,
                        enable: !historicalSearchOptions.enable,
                    });
                }}
                text=""
            />
            <span>
                How many recent terms do you want to search?{" "}
                <span className={Css.warning}>
                    {" "}
                    (this may affect performance!)
                </span>
            </span>
            <Dropdown
                choices={rangeOptions.map((range) => range.toString())}
                selected={historicalSearchOptions.range.toString()}
                onSelect={(index) => {
                    const selectedRange = rangeOptions[index] ?? 4;
                    setHistoricalSearchOptions({
                        ...historicalSearchOptions,
                        range: selectedRange,
                    });
                }}
                emptyPlaceholder={"none selected"}
            />
        </div>
    );
});

const ReportIssues = memo(function ReportIssues() {
    return (
        <div className={Css.issues}>
            <h3>Issues</h3>
            <p>
                If you have encountered any bug related to the website please
                either file a bug report on{" "}
                <a href={`${GITHUB_LINK}/issues`} target="_blank">
                    GitHub <Feather.ExternalLink />
                </a>{" "}
                or email us at hyperschedule@g.hmc.edu.
            </p>
            <p>
                If you have found any incorrect or inaccurate course
                information, please send us an email. We try our best to keep
                everything as up-to-date as possible, but we cannot manually go
                through the 20k+ classes in our database by hand and errors do
                slip through.
            </p>
        </div>
    );
});
