import Css from "./Schedule.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleSections } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
//import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import classNames from "classnames";

import GridBackground from "@components/schedule/GridBackground";

import {
    cardKey,
    getCards,
    hasWeekend,
    groupCardsByDay,
    stackCards,
    stackCardsReverse,
} from "@lib/schedule";

export default function Schedule() {
    const scheduleSections = useActiveScheduleSections();
    const sectionsLookup = useActiveSectionsLookup();

    if (!scheduleSections || !sectionsLookup) return <></>;

    // grid rows in units of 5mins, since (afaik) all classes' start/end times
    // are aligned to some multiple of 5mins?
    const overallStartTime = 7 * 12;
    const overallEndTime = 22 * 12;

    const sections: APIv4.Section[] = [];
    for (const entry of scheduleSections) {
        const section = sectionsLookup.get(
            APIv4.stringifySectionCodeLong(entry.section),
        );
        if (!section) continue;
        sections.push(section);
    }

    const cards = sections.flatMap(getCards);
    const weekend = hasWeekend(cards);

    const gridLines: JSX.Element[] = [];
    for (let i = overallStartTime + 12; i < overallEndTime; i += 12)
        gridLines.push(
            <div
                key={`hour:${i}`}
                className={classNames(Css.rowLine, {
                    [Css.noon]: i === 12 * 12,
                    [Css.evening]: i === 17 * 12,
                })}
                style={{ gridRow: i - overallStartTime }}
            ></div>,
        );

    const byDay = groupCardsByDay(cards);

    return (
        <div className={Css.viewport}>
            <div
                className={classNames(Css.grid, {
                    [Css.showSunday]: weekend.sunday,
                    [Css.showSaturday]: weekend.saturday,
                })}
                style={{
                    gridTemplateRows: `repeat(${
                        overallEndTime - overallStartTime
                    }, 1fr)`,
                }}
            >
                <GridBackground />
                {Object.values(byDay).flatMap((cards) => {
                    const order = stackCards(cards);
                    const revOrder = stackCardsReverse(cards);

                    return cards.map((card, i) => (
                        <div
                            key={`card:${cardKey(card)}`}
                            className={Css.card}
                            style={{
                                gridColumn: card.day,
                                gridRow: `${
                                    Math.floor(card.startTime / 300) -
                                    overallStartTime
                                } / ${
                                    Math.floor(card.endTime / 300) -
                                    overallStartTime
                                }`,
                                "--stack-order": order[i]!,
                                "--reverse-stack-order": revOrder[i]!,
                                ...sectionColorStyle(card.section),
                            }}
                        >
                            {APIv4.stringifySectionCode(card.section)}
                        </div>
                    ));
                })}
            </div>
        </div>
    );
}
