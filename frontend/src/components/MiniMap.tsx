import Css from "./MiniMap.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleSections } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import classNames from "classnames";

interface Card {
    section: APIv4.SectionIdentifier;
    day: APIv4.Weekday;
    startTime: number;
    endTime: number;
}

export default function MiniMap() {
    const scheduleSections = useActiveScheduleSections();
    const sectionsLookup = useActiveSectionsLookup();

    const expandKey = useStore((store) => store.expandKey);
    const setExpandKey = useStore((store) => store.setExpandKey);
    const clearExpand = useStore((store) => store.clearExpand);

    const sections: APIv4.Section[] = [];

    const expandSection = expandKey
        ? sectionsLookup.get(APIv4.stringifySectionCodeLong(expandKey))
        : null;
    const expandCards = expandSection ? getCards(expandSection) : [];

    // default bounds if no classes are outside this region
    let earliestClassTime = 8 * 3600; // 8am
    let latestClassTime = 18 * 3600; // 7pm

    for (const entry of scheduleSections) {
        const section = sectionsLookup.get(
            APIv4.stringifySectionCodeLong(entry.section),
        );
        if (!section) continue;
        sections.push(section);
        for (const schedule of section.schedules) {
            if (schedule.startTime === schedule.endTime) continue;
            // we use startTime-1 and endTime+1 to render an extra hour window on top and bottom
            earliestClassTime = Math.min(
                schedule.startTime - 1,
                earliestClassTime,
            );
            latestClassTime = Math.max(schedule.endTime + 1, latestClassTime);
        }
    }

    for (const card of expandCards) {
        if (card.startTime === card.endTime) continue;
        // we use startTime-1 and endTime+1 to render an extra hour window on top and bottom
        earliestClassTime = Math.min(card.startTime - 1, earliestClassTime);
        latestClassTime = Math.max(card.endTime + 1, latestClassTime);
    }

    const scheduleStartHour = Math.floor(earliestClassTime / 3600);
    const scheduleEndHour = Math.ceil(latestClassTime / 3600);

    // grid rows in units of 5mins, since (afaik) all classes' start/end times
    // are aligned to some multiple of 5mins?
    const overallStartTime = 0;
    const overallEndTime = 24 * 12;

    const weekend = { showSunday: false, showSaturday: false };
    const cards = sections.flatMap(getCards);
    for (const card of expandCards) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }
    for (const card of cards) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }

    // const gridLines: JSX.Element[] = [];
    // for (let i = overallStartTime + 12; i < overallEndTime; i += 12)
    //     gridLines.push(
    //         <div
    //             key={`hour:${i}`}
    //             className={classNames(Css.rowLine, {
    //                 [Css.noon as string]: i === 12 * 12,
    //                 [Css.evening as string]: i === 17 * 12,
    //             })}
    //             style={{gridRow: i - overallStartTime}}
    //         ></div>,
    //     );

    const byDay = collectByDay(cards);

    return (
        <div className={Css.visibleWindowContainer}>
            <div
                className={classNames([Css.minimapLabelTop, Css.minimapLabel])}
            >
                <span>{weekend.showSunday ? "S" : "M"}</span>{" "}
                <span>{weekend.showSaturday ? "S" : "F"}</span>
            </div>
            <div
                className={classNames([
                    Css.minimapLabelRight,
                    Css.minimapLabel,
                ])}
            >
                <span>{scheduleStartHour}am</span>
                <span>{scheduleEndHour - 12}pm</span>
            </div>
            <div className={Css.visibleWindow}>
                <div
                    className={classNames(Css.grid, {
                        [Css.showSunday as string]: weekend.showSunday,
                        [Css.showSaturday as string]: weekend.showSaturday,
                    })}
                    style={{
                        gridTemplateRows: `repeat(${
                            overallEndTime - overallStartTime
                        }, 1fr)`,
                        height: `${
                            (24 / (scheduleEndHour - scheduleStartHour)) * 100
                        }%`,
                        transform: `translate(${
                            weekend.showSunday ? 0 : -100 / 7
                        }%,-${(scheduleStartHour / 24) * 100}%)`,
                    }}
                >
                    {["U", "M", "T", "W", "R", "F", "S"].map((day, i) => (
                        <div
                            key={`day:${day}`}
                            className={classNames(Css.dayBackground, {
                                [Css.odd as string]: i & 1,
                            })}
                            style={{ gridColumn: day }}
                        ></div>
                    ))}
                    {expandCards.map((card) => (
                        <div
                            key={`outline:${cardKey(card)}`}
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
                        const order = stackCards(cards);
                        const revOrder = stackCardsReverse(cards);

                        return cards.map((card, i) => (
                            <div
                                key={`card:${cardKey(card)}`}
                                className={Css.card}
                                style={
                                    {
                                        gridColumn: card.day,
                                        gridRow: `${
                                            Math.floor(card.startTime / 300) -
                                            overallStartTime
                                        } / ${
                                            Math.floor(card.endTime / 300) -
                                            overallStartTime
                                        }`,
                                        ...sectionColorStyle(card.section),
                                        "--stack-order": order[i],
                                        "--reverse-stack-order": revOrder[i],
                                        boxShadow:
                                            order[i] === 0
                                                ? "none"
                                                : "0 0 0.25rem var(--shadow)",
                                    } as any
                                }
                                onClick={() => setExpandKey(card.section)}
                            ></div>
                        ));
                    })}
                    {/*cards.map((card) => (
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
                            ...sectionColorStyle(card.section),
                        }}
                    ></div>
                ))*/}
                </div>
            </div>
        </div>
    );
}

function cardKey(card: Readonly<Card>) {
    return `${APIv4.stringifySectionCodeLong(card.section)}:${card.day}/${
        card.startTime
    }-${card.endTime}`;
}

function getCards(section: APIv4.Section) {
    const cards: Card[] = [];
    for (const schedule of section.schedules) {
        if (schedule.startTime === schedule.endTime) continue;

        for (const day of schedule.days)
            cards.push({
                day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                section: section.identifier,
            });
    }
    return cards;
}

function collectByDay(cards: readonly Readonly<Card>[]) {
    const byDay: Record<APIv4.Weekday, Readonly<Card>[]> = {
        [APIv4.Weekday.monday]: [],
        [APIv4.Weekday.tuesday]: [],
        [APIv4.Weekday.wednesday]: [],
        [APIv4.Weekday.thursday]: [],
        [APIv4.Weekday.friday]: [],
        [APIv4.Weekday.saturday]: [],
        [APIv4.Weekday.sunday]: [],
    };
    for (const card of cards) byDay[card.day].push(card);
    return byDay;
}

function stackCards(cards: Readonly<Card>[]) {
    const order: number[] = [0];
    cards.sort((a, b) => a.endTime - b.endTime || a.startTime - b.startTime);

    for (let i = 1; i < cards.length; ++i) {
        const current = cards[i]!;
        let maxDepth = -1;

        for (let j = i - 1; j >= 0; --j) {
            const prev = cards[j]!;
            if (current.startTime >= prev.endTime) break;
            maxDepth = Math.max(maxDepth, order[j]!);
        }

        order[i] = maxDepth + 1;
    }

    return order;
}

function stackCardsReverse(cards: Readonly<Card>[]) {
    const order: number[] = [];
    order[cards.length - 1] = 0;

    cards.sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);

    for (let i = cards.length - 1; i >= 0; --i) {
        const current = cards[i]!;
        let maxDepth = -1;

        for (let j = i + 1; j < cards.length; ++j) {
            const prev = cards[j]!;
            if (current.endTime <= prev.startTime) break;
            maxDepth = Math.max(maxDepth, order[j]!);
        }

        order[i] = maxDepth + 1;
    }

    return order;
}
