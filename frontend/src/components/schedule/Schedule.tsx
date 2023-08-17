import Css from "./Schedule.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
//import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/color";

import classNames from "classnames";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";
import GridBackgroundRows from "@components/schedule/GridBackgroundRows";

import {
    cardKey,
    hasWeekend,
    groupCardsByDay,
    mergeCards,
    comparePriority,
    stackCards,
    stackCardsReverse,
} from "@lib/schedule";
import useStore from "@hooks/store";

export default function Schedule() {
    const { sections, cards, bounds, startHour, endHour } =
        useActiveScheduleResolved();
    const sectionsLookup = useActiveSectionsLookup();
    const theme = useStore((store) => store.theme);

    const weekend = hasWeekend(cards);

    const byDay = groupCardsByDay(cards);

    return (
        <div
            className={classNames(Css.container, {
                [Css.showSunday]: weekend.sunday,
                [Css.showSaturday]: weekend.saturday,
            })}
            style={
                {
                    "--start-hour": startHour,
                    "--end-hour": endHour,
                } as React.CSSProperties
            }
        >
            <DayLabels />
            <TimeLabels />
            <div className={Css.viewport}>
                <div className={Css.grid}>
                    <GridBackgroundColumns />
                    <GridBackgroundRows />
                    {Object.entries(byDay).flatMap(([day, cards]) => {
                        const groups = mergeCards(cards);

                        //const order = stackCards(cards);
                        //const revOrder = stackCardsReverse(cards);

                        return groups.flatMap((group) =>
                            group.cards.sort(comparePriority).map((card, i) => (
                                <div
                                    key={`card:${cardKey(card)}`}
                                    className={Css.card}
                                    style={
                                        {
                                            gridColumn: card.day,
                                            gridRow: `${
                                                Math.floor(
                                                    card.startTime / 300,
                                                ) + 1
                                            } / ${
                                                Math.floor(card.endTime / 300) +
                                                1
                                            }`,
                                            "--stack-order": i,
                                            "--reverse-stack-order":
                                                group.cards.length - i - 1,
                                            ...sectionColorStyle(
                                                card.section,
                                                theme,
                                            ),
                                            "--opacity":
                                                group.cards.length === 1
                                                    ? 1
                                                    : (1 -
                                                          (group.cards.length -
                                                              i -
                                                              1) /
                                                              group.cards
                                                                  .length) *
                                                          0.25 +
                                                      0.75,
                                        } as React.CSSProperties
                                    }
                                >
                                    {APIv4.stringifySectionCode(card.section)}
                                </div>
                            )),
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TimeLabels() {
    const labels: JSX.Element[] = [];
    for (let i = 0; i < 24; ++i)
        labels.push(
            <div key={i}>
                {((i - 1) % 12) + 1}
                {i < 12 ? "am" : "pm"}
            </div>,
        );

    return (
        <div className={Css.timeLabelViewport}>
            <div className={Css.labelGrid}>{labels}</div>
        </div>
    );
}

function DayLabels() {
    return (
        <div className={Css.dayLabelViewport}>
            <div className={Css.labelGrid}>
                <div>Sunday</div>
                <div>Monday</div>
                <div>Tuesday</div>
                <div>Wednesday</div>
                <div>Thursday</div>
                <div>Friday</div>
                <div>Saturday</div>
            </div>
        </div>
    );
}
