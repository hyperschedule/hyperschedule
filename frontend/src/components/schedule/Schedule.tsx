import Css from "./Schedule.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import { useActiveSectionsLookup } from "@hooks/section";
import { Fragment } from "react";

import { sectionColorStyle } from "@lib/color";

import classNames from "classnames";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";
import GridBackgroundRows from "@components/schedule/GridBackgroundRows";

import SectionStatusBadge from "@components/common/SectionStatusBadge";

import {
    type Card,
    cardKey,
    comparePriority,
    groupCardsByDay,
    hasWeekend,
    mergeCards,
} from "@lib/schedule";
import useStore, {
    PopupOption,
    type ScheduleRenderingOptions,
} from "@hooks/store";
import { scheduleContainerId } from "@lib/constants";

export default function Schedule(props: ScheduleRenderingOptions) {
    const { sections, cards, bounds, startHour, endHour, unconflicting } =
        useActiveScheduleResolved();
    const sectionsLookup = useActiveSectionsLookup();

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
            id={scheduleContainerId}
        >
            <DayLabels />
            <TimeLabels />
            <div className={Css.viewport}>
                <div
                    className={Css.grid}
                    data-show-conflict={!props.hideConflicting || undefined}
                >
                    <GridBackgroundColumns />
                    <GridBackgroundRows />
                    {Object.entries(byDay).flatMap(([day, cards]) => {
                        const groups = mergeCards(cards);

                        //const order = stackCards(cards);
                        //const revOrder = stackCardsReverse(cards);

                        return groups.flatMap((group) => {
                            const cards = group.cards.sort(comparePriority);

                            return cards.map((card, i) => (
                                <Card
                                    key={`card:${cardKey(card)}`}
                                    card={card}
                                    conflict={
                                        !unconflicting.has(card.sectionObj)
                                    }
                                    orderFromTop={i}
                                    orderFromBottom={group.cards.length - 1 - i}
                                    totalCardsInGroup={group.cards.length}
                                    hideStatus={props.hideStatus}
                                />
                            ));
                        });
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

function Card(props: {
    readonly card: Readonly<Card>;
    readonly orderFromTop: number;
    readonly orderFromBottom: number;
    readonly totalCardsInGroup: number;
    readonly hideStatus: boolean;
    readonly conflict: boolean;
}) {
    const theme = useStore((store) => store.theme);
    const setPopup = useStore((store) => store.setPopup);
    const sectionsLookup = useActiveSectionsLookup();

    const section = sectionsLookup.get(
        APIv4.stringifySectionCodeLong(props.card.section),
    );

    return (
        <div
            className={Css.card}
            style={
                {
                    gridColumn: props.card.day,
                    gridRow: `${Math.floor(props.card.startTime / 300) + 1} / ${
                        Math.floor(props.card.endTime / 300) + 1
                    }`,
                    "--stack-order": props.orderFromTop,
                    "--reverse-stack-order": props.orderFromBottom,
                    "--group-size": props.totalCardsInGroup,
                    ...sectionColorStyle(props.card.section, theme),
                } as React.CSSProperties
            }
            onClick={() =>
                setPopup({
                    option: PopupOption.SectionDetail,
                    section: props.card.section,
                })
            }
            data-conflict={props.conflict || undefined}
        >
            <div className={Css.code}>
                {APIv4.stringifySectionCode(props.card.section)}
            </div>
            {section ? (
                <>
                    <div className={Css.title}>{section.course.title}</div>
                    {props.hideStatus ? (
                        <></>
                    ) : (
                        <div className={Css.status}>
                            <div>
                                {section.seatsFilled} / {section.seatsTotal}
                            </div>
                            <SectionStatusBadge status={section.status} />
                        </div>
                    )}
                </>
            ) : (
                "TODO DEAD"
            )}
            <div className={Css.location}>
                {props.card.locations.join(", ")}
            </div>
            {props.card.section.half && (
                <div className={Css.half}>
                    ({props.card.section.half.number === 1 ? "first" : "second"}{" "}
                    half semester)
                </div>
            )}
        </div>
    );
}
