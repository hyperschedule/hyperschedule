import Css from "./About.module.css";
import * as Feather from "react-feather";

export default function About() {
    return (
        <div className={Css.about}>
            <h2>About</h2>

            <p>
                Hyperschedule is a student-run course scheduler for the
                Claremont Colleges.
            </p>
            <h3>Current Maintainer</h3>
            <p>
                <a href="https://github.com/mia1024" target="_blank">
                    Mia Celeste <Feather.ExternalLink />
                </a>
                , HM '24
            </p>
            <h3>Previous Maintainers</h3>
            <p>
                <a href="https://github.com/kwshi" target="_blank">
                    Kye Shi <Feather.ExternalLink />
                </a>
                , HM '22
            </p>
            <p>
                <a href="github.com/raxod502" target="_blank">
                    Radon Rosborough <Feather.ExternalLink />
                </a>{" "}
                , HM '20
            </p>
        </div>
    );
}
