import Css from "./About.module.css";
import { GITHUB_LINK } from "@lib/constants";
import { memo } from "react";
import * as Feather from "react-feather";

type Maintainer = {
    name: string;
    classYear: string;
    githubName: string;
};

// future maintainer: don't forget to also add your name to
// frontend/vite.config.ts
const currentMaintainers: Maintainer[] = [
    {
        name: "Next Ongarjvaja",
        classYear: "HM '26",
        githubName: "NextZtepS",
    },
    {
        name: "Edward Donson",
        classYear: "HM '26",
        githubName: "edonson2016",
    },
    {
        name: "Stephen Xu",
        classYear: "HM '27",
        githubName: "stuxf",
    },
];

const previousMaintainers: Maintainer[] = [
    {
        name: "Mia Celeste",
        classYear: "HM '24",
        githubName: "mia1024",
    },
    {
        name: "Kye Shi",
        classYear: "HM '22",
        githubName: "kwshi",
    },
    {
        name: "Radon Rosborough",
        classYear: "HM '20",
        githubName: "raxod502",
    },
];

const GitHubLink = memo(function (props: {
    name: string | null;
    username: string;
}) {
    return (
        <a href={`https://github.com/${props.username}`} target="_blank">
            {props.name ?? props.username}
            {/*<Feather.ExternalLink/>*/}
        </a>
    );
});

function createMaintainerRow(m: Maintainer) {
    return (
        <p key={m.githubName}>
            <GitHubLink name={m.name} username={m.githubName} />, {m.classYear}
        </p>
    );
}

export default memo(function About() {
    return (
        <div className={Css.about}>
            <h2>About</h2>

            <p>
                Hyperschedule is a student-run course scheduler for the
                Claremont Colleges.
            </p>
            <h3>
                Current Maintainer{currentMaintainers.length > 1 ? "s" : ""}
            </h3>
            {currentMaintainers.map(createMaintainerRow)}
            <h3>Previous Maintainers</h3>
            {previousMaintainers.map(createMaintainerRow)}

            <h3>Contributors</h3>
            <div className={Css.contributors}>
                {__CONTRIBUTOR_GH_NAMES__.map(({ name, username }) => (
                    <GitHubLink
                        key={username}
                        username={username}
                        name={name}
                    />
                ))}
            </div>
            <div className={Css.issues}>
                <h3>Issues</h3>
                <p>
                    If you have encountered any bug related to the website
                    please either file a bug report on{" "}
                    <a href={`${GITHUB_LINK}/issues`} target="_blank">
                        GitHub <Feather.ExternalLink />
                    </a>{" "}
                    or email us at hyperschedule@g.hmc.edu.
                </p>
                <p>
                    If you have found any incorrect or inaccurate course
                    information, please send us an email. We try our best to
                    keep everything as up-to-date as possible, but we cannot
                    manually go through the 20k+ classes in our database by hand
                    and errors do slip through.
                </p>
            </div>
            <h3>License</h3>
            <p>
                Hyperschedule is licensed under{" "}
                <a href="https://spdx.org/licenses/BSD-3-Clause-No-Military-License.html">
                    BSD 3-Clause No Military License
                </a>
                . By using this program, you acknowledge that you are not
                voluntarily involved in the design, construction, operation,
                maintenance, or training of any military facility.
            </p>
        </div>
    );
});
