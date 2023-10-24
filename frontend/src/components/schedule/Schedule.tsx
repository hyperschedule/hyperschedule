import Css from "./Schedule.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";

import { sectionColorStyle } from "@lib/color";

import classNames from "classnames";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";
import GridBackgroundRows from "@components/schedule/GridBackgroundRows";

import SectionStatusBadge from "@components/common/SectionStatusBadge";

import {
    type Card,
    cardKey,
    combineLocations,
    comparePriority,
    groupCardsByDay,
    hasWeekend,
    mergeCards,
} from "@lib/schedule";
import useStore, { type ScheduleRenderingOptions } from "@hooks/store";
import { PopupOption } from "@lib/popup";
import { SCHEDULE_CONTAINER_ID } from "@lib/constants";
import type { CSSProperties } from "react";

export default function Schedule(props: ScheduleRenderingOptions) {
    const { cards, startHour, endHour, unconflicting } =
        useActiveScheduleResolved();

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
            id={SCHEDULE_CONTAINER_ID}
        >
            <DayLabels />
            <TimeLabels startHour={startHour} endHour={endHour} />
            <div className={Css.viewport}>
                <div
                    className={Css.grid}
                    data-show-conflict={props.showConflicting || undefined}
                >
                    <GridBackgroundColumns />
                    <GridBackgroundRows />
                    {Object.entries(byDay).flatMap(([, cards]) => {
                        const groups = mergeCards(cards);

                        //const order = stackCards(cards);
                        //const revOrder = stackCardsReverse(cards);

                        return groups.flatMap((group) => {
                            const cards = group.cards.sort(comparePriority);

                            return cards.map((card, i) => (
                                <Card
                                    key={`card:${cardKey(card)}`}
                                    card={card}
                                    conflict={!unconflicting.has(card.section)}
                                    orderFromTop={i}
                                    orderFromBottom={group.cards.length - 1 - i}
                                    totalCardsInGroup={group.cards.length}
                                />
                            ));
                        });
                    })}
                </div>
            </div>
        </div>
    );
}

function TimeLabels(props: { startHour: number; endHour: number }) {
    const labels: JSX.Element[] = [];
    for (let h = 0; h < 24; ++h)
        labels.push(
            <div
                key={h}
                className={classNames({
                    [Css.offsetY]: h !== props.startHour && h !== props.endHour,
                })}
            >
                {((h - 1) % 12) + 1}
                {h < 12 ? "am" : "pm"}
            </div>,
        );

    return (
        <div className={Css.timeLabelViewport}>
            <div className={Css.labelGrid}>{labels}</div>
        </div>
    );
}

const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function DayLabels() {
    return (
        <div className={Css.dayLabelViewport}>
            <div className={Css.labelGrid}>
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className={Css.dayLabel}
                        style={
                            {
                                "--label": `"${day}"`,
                                "--labelShort": `"${day.slice(0, 3)}"`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>
        </div>
    );
}

function Card(props: {
    card: Readonly<Card>;
    orderFromTop: number;
    orderFromBottom: number;
    totalCardsInGroup: number;
    conflict: boolean;
}) {
    const theme = useStore((store) => store.theme);
    const setPopup = useStore((store) => store.setPopup);
    const sectionsLookup = useActiveSectionsLookup();

    const section = sectionsLookup.get(
        APIv4.stringifySectionCodeLong(props.card.section.identifier),
    );
    if (section === undefined) {
        return <>Error</>;
    }

    return (
        <div
            className={classNames(Css.card, {
                [Css.firstHalf]:
                    props.card.section.identifier.half?.number === 1,
                [Css.secondHalf]:
                    props.card.section.identifier.half?.number === 2,
            })}
            style={
                {
                    gridColumn: props.card.day,
                    gridRow: `${Math.floor(props.card.startTime / 300) + 1} / ${
                        Math.floor(props.card.endTime / 300) + 1
                    }`,
                    "--stack-order": props.orderFromTop,
                    "--reverse-stack-order": props.orderFromBottom,
                    "--group-size": props.totalCardsInGroup,
                    ...sectionColorStyle(
                        props.card.section.identifier,
                        theme,
                        false,
                    ),
                } as React.CSSProperties
            }
            onClick={() =>
                setPopup({
                    option: PopupOption.SectionDetail,
                    section: props.card.section.identifier,
                })
            }
            data-conflict={props.conflict || undefined}
        >
            <div className={Css.code}>
                {APIv4.stringifySectionCode(props.card.section.identifier)}
            </div>

            <div className={Css.title}>{section.course.title}</div>

            <div className={Css.location}>
                {combineLocations(props.card.locations).join(", ")}
            </div>

            {props.card.section.identifier.half && (
                <div className={Css.half}>
                    (
                    {props.card.section.identifier.half.number === 1
                        ? "first"
                        : "second"}{" "}
                    half)
                </div>
            )}
        </div>
    );
}
