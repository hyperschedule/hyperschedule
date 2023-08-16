import Css from "./Schedule.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
//import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import classNames from "classnames";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";
import GridBackgroundRows from "@components/schedule/GridBackgroundRows";

import {
    cardKey,
    hasWeekend,
    groupCardsByDay,
    stackCards,
    stackCardsReverse,
} from "@lib/schedule";

export default function Schedule() {
    const { sections, cards, bounds, startHour, endHour } =
        useActiveScheduleResolved();
    const sectionsLookup = useActiveSectionsLookup();

    const weekend = hasWeekend(cards);

    const byDay = groupCardsByDay(cards);

    return (
        <div
            className={classNames(Css.container, {
                // bullshit !: <https://github.com/facebook/create-react-app/issues/11156>
                [Css.showSunday!]: weekend.sunday,
                [Css.showSaturday!]: weekend.saturday,
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
                                            Math.floor(card.startTime / 300) + 1
                                        } / ${
                                            Math.floor(card.endTime / 300) + 1
                                        }`,
                                        "--stack-order": order[i]!,
                                        "--reverse-stack-order": revOrder[i]!,
                                        ...(order[i] === 0
                                            ? { boxShadow: "none" }
                                            : {}),
                                        ...sectionColorStyle(card.section),
                                    } as React.CSSProperties
                                }
                            >
                                {APIv4.stringifySectionCode(card.section)}
                            </div>
                        ));
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
