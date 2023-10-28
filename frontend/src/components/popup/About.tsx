import Css from "./About.module.css";
import { memo } from "react";

type Maintainer = {
    name: string;
    classYear: string;
    githubName: string;
};

// future maintainer: don't forget to also add your name to
// frontend/vite.config.ts
const currentMaintainers: Maintainer[] = [
    {
        name: "Mia Celeste",
        classYear: "HM '24",
        githubName: "mia1024",
    },
];

const previousMaintainers: Maintainer[] = [
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

const GitHubLink = memo(function (props: { name?: string; username: string }) {
    return (
        <a href={`https://github.com/${props.username}`} target="_blank">
            {props.name ?? props.username}
            {/*<Feather.ExternalLink/>*/}
        </a>
    );
});

function createMaintainerRow(m: Maintainer) {
    return (
        <p>
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
                {__CONTRIBUTOR_GH_NAMES__.map((name) => (
                    <GitHubLink key={name} username={name} />
                ))}
            </div>
        </div>
    );
});
