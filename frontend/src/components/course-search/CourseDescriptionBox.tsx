import * as APIv4 from "hyperschedule-shared/api/v4";
import { useCourseAreaDescription } from "@hooks/api/query";
import { useOfferingHistoryLookup } from "@hooks/history";

import { formatTime12 } from "@lib/time";
import { memo } from "react";
import Css from "./CourseDescriptionBox.module.css";
import * as Feather from "react-feather";
import { combineLocations } from "@lib/schedule";
import { computeMuddCredits } from "@lib/credits";
import SectionStatusBadge from "@components/common/SectionStatusBadge";
import { useState } from "react";
import { useAllTerms } from "@hooks/term";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

// certain course descriptions contain links, such as PE 095B
const linkHtmlMatcher = /<a +href="?([A-Za-z0-9:\/.%_-]+)"?.*>(.*)<\/a>/;

function processDescription(description: string): JSX.Element {
    const match = linkHtmlMatcher.exec(description);

    if (match !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const before = description.slice(0, start);
        const after = description.slice(end);
        return (
            <>
                {before}
                <a href={match[1]} target="_blank">
                    {match[2]} <Feather.ExternalLink size={"1em"} />
                </a>
                {after}
            </>
        );
    } else {
        return <>{description}</>;
    }
}

const campusCss = [
    // this is ordered by the year the school is established
    Css.pom,
    Css.scr,
    Css.cmc,
    Css.hmc,
    Css.ptz,
];

// 3 years if offered every semester
const HISTORY_ENTRY_CUTOFF = 6;

export default memo(function CourseDescriptionBox(props: {
    section: APIv4.Section;
    showStatus: boolean;
}) {
    const descriptions = useCourseAreaDescription().data;
    const offeringHistory = useOfferingHistoryLookup();
    const allTerms = useAllTerms();
    let minYear = CURRENT_TERM.year;
    for (const t of allTerms ?? []) {
        if (t.year < minYear) minYear = t.year;
    }

    const historyEntry = offeringHistory.get(
        APIv4.stringifyCourseCode(props.section.course.code),
    );

    const [renderAllHistory, setRenderAllHistory] = useState<boolean>(false);

    let pastOfferings: JSX.Element | JSX.Element[];
    if (historyEntry === undefined || historyEntry.length === 0) {
        pastOfferings = <li className={Css.none}>(none since {minYear})</li>;
    } else {
        pastOfferings = (
            renderAllHistory || historyEntry.length < HISTORY_ENTRY_CUTOFF
                ? historyEntry
                : historyEntry.slice(0, HISTORY_ENTRY_CUTOFF)
        ).map((term) => {
            const termString = APIv4.stringifyTermIdentifier(term);
            return <li key={termString}>{termString}</li>;
        });
    }

    const instructors = props.section.instructors
        .map((i) => i.name.trim())
        .filter((s) => s !== "");

    return (
        <div className={Css.root}>
            {props.showStatus ? (
                <div className={Css.statusRow}>
                    <SectionStatusBadge status={props.section.status} />
                    <span className={Css.statusText}>
                        {props.section.seatsFilled}/{props.section.seatsTotal}{" "}
                        seats filled
                        {props.section.permCount === 0 ? (
                            <></>
                        ) : (
                            <>, {props.section.permCount} PERMs</>
                        )}
                    </span>
                </div>
            ) : (
                <></>
            )}
            <p className={Css.description}>
                {processDescription(props.section.course.description)}
            </p>
            <section className={Css.credits}>
                <h3>
                    HMC Credit{computeMuddCredits(props.section) > 1 ? "s" : ""}
                </h3>
                <div>{computeMuddCredits(props.section)}</div>
            </section>

            {props.section.course.primaryAssociation === APIv4.School.HMC ? (
                <></>
            ) : (
                <section className={Css.credits}>
                    <h3>
                        {" "}
                        {APIv4.schoolCodeToName(
                            props.section.course.primaryAssociation,
                        )}{" "}
                        Credit{props.section.credits > 1 ? "s" : ""}
                    </h3>
                    <div>{props.section.credits}</div>
                </section>
            )}

            <section className={Css.instructors}>
                <h3>Instructor{instructors.length > 1 ? "s" : ""}</h3>
                <ul>
                    {instructors.map((name) => (
                        <li key={name}>{name}</li>
                    ))}
                </ul>
            </section>
            <section className={Css.areas}>
                <h3>Course Areas</h3>
                <ul>
                    {descriptions === undefined ? (
                        <span>No data</span>
                    ) : (
                        props.section.courseAreas.map((code) => {
                            const campus = code.charCodeAt(0) - 48 - 1; // 48 is the ascii code for '0'
                            let cls: string;
                            if (campus < 5) cls = campusCss[campus]!;
                            else cls = "";

                            return (
                                <li key={code} className={cls}>
                                    {descriptions.get(code) ?? code}
                                </li>
                            );
                        })
                    )}
                </ul>
            </section>
            <section className={Css.schedule}>
                <h3>Schedule</h3>
                <ul>
                    {props.section.schedules.map((slot, i) => (
                        <li key={i}>
                            {slot.days.join("")} {formatTime12(slot.startTime)}
                            &ndash;
                            {formatTime12(slot.endTime)} @{" "}
                            {combineLocations(slot.locations).join(", ")}
                        </li>
                    ))}
                    {props.section.identifier.half === null ? (
                        <></>
                    ) : (
                        <li key={"half"}>
                            (
                            {props.section.identifier.half.number === 1
                                ? "first"
                                : "second"}{" "}
                            half semester only)
                        </li>
                    )}
                </ul>
            </section>
            <section className={Css.history}>
                <>
                    <h3>Past Offerings</h3>
                    <ul>
                        {pastOfferings}
                        {renderAllHistory ||
                        (historyEntry ?? []).length < HISTORY_ENTRY_CUTOFF ? (
                            <></>
                        ) : (
                            <li
                                className={Css.remaining}
                                onClick={() => setRenderAllHistory(true)}
                            >
                                (&hellip;{" "}
                                {historyEntry!.length - HISTORY_ENTRY_CUTOFF}{" "}
                                more)
                            </li>
                        )}
                    </ul>
                </>
            </section>
            {props.section.identifier.affiliation ===
            props.section.course.primaryAssociation ? (
                <></>
            ) : (
                <section>
                    <h3>Primary Association</h3>
                    <span>
                        {APIv4.schoolCodeToName(
                            props.section.course.primaryAssociation,
                        )}
                    </span>
                </section>
            )}
        </div>
    );
});
