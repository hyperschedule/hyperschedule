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

    const sections: APIv4.Section[] = [];

    const expandSection = expandKey
        ? sectionsLookup.get(APIv4.stringifySectionCodeLong(expandKey))
        : null;
    const expandCards = expandSection ? Schedule.getCards(expandSection) : [];

    // default bounds if no classes are outside this region
    let earliestClassTime = 8 * 3600; // 8am
    let latestClassTime = 19 * 3600; // 7pm

    for (const entry of scheduleSections) {
        const section = sectionsLookup.get(
            APIv4.stringifySectionCodeLong(entry.section),
        );
        if (!section) continue;
        sections.push(section);
        for (const schedule of section.schedules) {
            if (schedule.startTime === schedule.endTime) continue;
            earliestClassTime = Math.min(schedule.startTime, earliestClassTime);
            latestClassTime = Math.max(schedule.endTime, latestClassTime);
        }
    }

    for (const card of expandCards) {
        if (card.startTime === card.endTime) continue;
        earliestClassTime = Math.min(card.startTime, earliestClassTime);
        latestClassTime = Math.max(card.endTime, latestClassTime);
    }

    const scheduleStartHour = Math.floor(earliestClassTime / 3600);
    const scheduleEndHour = Math.ceil(latestClassTime / 3600);

    // grid rows in units of 5mins, since (afaik) all classes' start/end times
    // are aligned to some multiple of 5mins?
    const overallStartTime = scheduleStartHour * 12;
    const overallEndTime = scheduleEndHour * 12;

    const weekend = { showSunday: false, showSaturday: false };
    const cards = sections.flatMap(Schedule.getCards);
    for (const card of expandCards) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }
    for (const card of cards) {
        weekend.showSunday ||= card.day === APIv4.Weekday.sunday;
        weekend.showSaturday ||= card.day === APIv4.Weekday.saturday;
    }

    const byDay = Schedule.groupCardsByDay(cards);

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
                    }}
                >
                    <GridBackground />
                    {expandCards.map((card) => (
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
                </div>
            </div>
        </div>
    );
}
