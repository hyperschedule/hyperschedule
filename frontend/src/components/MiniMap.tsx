import Css from "./MiniMap.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleSections } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import GridBackground from "@components/schedule/GridBackground";

import classNames from "classnames";

import * as Schedule from "@lib/schedule";

export default function MiniMap() {
    const scheduleSections = useActiveScheduleSections();
    const sectionsLookup = useActiveSectionsLookup();

    const expandKey = useStore((store) => store.expandKey);
    const setExpandKey = useStore((store) => store.setExpandKey);
    const clearExpand = useStore((store) => store.clearExpand);

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

    const expandSection = expandKey
        ? sectionsLookup.get(APIv4.stringifySectionCodeLong(expandKey))
        : null;
    const expandCards = expandSection ? Schedule.getCards(expandSection) : null;

    const weekend = { showSunday: false, showSaturday: false };
    const cards = sections.flatMap(Schedule.getCards);
    for (const card of expandCards ?? []) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }
    for (const card of cards) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }

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

    const byDay = Schedule.groupCardsByDay(cards);

    return (
        <div className={Css.viewport}>
            <div
                className={classNames(Css.grid, {
                    [Css.showSunday]: weekend.showSunday,
                    [Css.showSaturday]: weekend.showSaturday,
                })}
                style={{
                    gridTemplateRows: `repeat(${
                        overallEndTime - overallStartTime
                    }, 1fr)`,
                }}
            >
                <GridBackground />
                {expandCards?.map((card) => (
                    <div
                        key={`outline:${Schedule.cardKey(card)}`}
                        className={Css.expandOutline}
                        style={{
                            gridColumn: card.day,
                            gridRow: `${
                                Math.floor(card.startTime / 300) -
                                overallStartTime
                            } / ${
                                Math.floor(card.endTime / 300) -
                                overallStartTime
                            }`,
                            ...sectionColorStyle(card.section),
                        }}
                        onClick={clearExpand}
                    ></div>
                ))}
                {Object.values(byDay).flatMap((cards) => {
                    const order = Schedule.stackCards(cards);
                    const revOrder = Schedule.stackCardsReverse(cards);

                    return cards.map((card, i) => (
                        <div
                            key={`card:${Schedule.cardKey(card)}`}
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
                            onClick={() => setExpandKey(card.section)}
                        ></div>
                    ));
                })}
            </div>
        </div>
    );
}
