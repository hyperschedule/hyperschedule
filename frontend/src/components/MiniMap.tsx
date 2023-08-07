import Css from "./MiniMap.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleSections } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import GridBackground from "@components/schedule/GridBackground";

import classNames from "classnames";

import {
    getCards,
    cardKey,
    mergeCards,
    groupCardsByDay,
    timeHull,
} from "@lib/schedule";

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
    let latestClassTime = 18 * 3600; // 6pm

    for (const entry of scheduleSections) {
        const section = sectionsLookup.get(
            APIv4.stringifySectionCodeLong(entry.section),
        );
        if (!section) continue;
        sections.push(section);
        for (const schedule of section.schedules) {
            // use startTime - 1 and endTime + 1 to render an extra hour around the schedule window
            if (schedule.startTime === schedule.endTime) continue;
            earliestClassTime = Math.min(
                schedule.startTime - 1,
                earliestClassTime,
            );
            latestClassTime = Math.max(schedule.endTime + 1, latestClassTime);
        }
    }

    for (const card of expandCards) {
        if (card.startTime === card.endTime) continue;
        // use startTime - 1 and endTime + 1 to render an extra hour around the schedule window
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

    const byDay = groupCardsByDay(cards);

    return (
        <div className={Css.viewportContainer}>
            <div
                className={classNames([
                    Css.viewportLabelTop,
                    Css.viewportLabel,
                ])}
            >
                <span>{weekend.showSunday ? "S" : "M"}</span>{" "}
                <span>{weekend.showSaturday ? "S" : "F"}</span>
            </div>
            <div
                className={classNames([
                    Css.viewportLabelRight,
                    Css.viewportLabel,
                ])}
            >
                <span>{scheduleStartHour}am</span>
                <span>{scheduleEndHour - 12}pm</span>
            </div>
            <div className={Css.viewport}>
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
                    <GridBackground />
                    {expandCards.map((card) => (
                        <div
                            key={`outline:${cardKey(card)}`}
                            className={Css.expandOutline}
                            style={{
                                gridColumn: card.day,
                                gridRow: `${
                                    Math.floor(card.startTime / 300) -
                                    overallStartTime +
                                    1
                                } / ${
                                    Math.floor(card.endTime / 300) -
                                    overallStartTime +
                                    1
                                }`,
                                ...sectionColorStyle(card.section),
                            }}
                            onClick={clearExpand}
                        ></div>
                    ))}
                    {Object.entries(byDay).flatMap(([day, cards]) =>
                        mergeCards(cards).map((group, i) => {
                            const hull = timeHull(group);
                            return (
                                <div
                                    key={`${group}:${day}/${i}`}
                                    className={Css.cardGroup}
                                    style={{
                                        gridColumn: day,
                                        gridRow: `${
                                            Math.round(hull.startTime / 300) -
                                            overallStartTime +
                                            1
                                        } / ${
                                            Math.round(hull.endTime / 300) -
                                            overallStartTime +
                                            1
                                        }`,
                                        gridTemplateRows: `repeat(${Math.round(
                                            (hull.endTime - hull.startTime) /
                                                300,
                                        )},1fr)`,
                                        gridTemplateColumns: `repeat(${group.length},1fr)`,
                                    }}
                                >
                                    {group.map((card, i) => (
                                        <div
                                            key={`slice:${APIv4.stringifySectionCodeLong(
                                                card.section,
                                            )}/${i}`}
                                            className={Css.slice}
                                            style={{
                                                gridColumn: `${i + 1}`,
                                                gridRow: `${
                                                    Math.round(
                                                        (card.startTime -
                                                            hull.startTime) /
                                                            300,
                                                    ) + 1
                                                } / ${
                                                    Math.round(
                                                        (card.endTime -
                                                            hull.startTime) /
                                                            300,
                                                    ) + 1
                                                }`,
                                                ...sectionColorStyle(
                                                    card.section,
                                                ),
                                            }}
                                            onClick={() =>
                                                setExpandKey(card.section)
                                            }
                                        ></div>
                                    ))}
                                </div>
                            );
                        }),
                    )}
                </div>
            </div>
        </div>
    );
}
