import Css from "./MiniMap.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/color";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";

import classNames from "classnames";
import {
    type Card,
    cardKey,
    cardOverlap,
    comparePriority,
    computeCardRows,
    groupCardsByDay,
    mergeCards,
} from "@lib/schedule";
import { memo } from "react";
import * as Feather from "react-feather";
import { PopupOption } from "@lib/popup";

const MORNING_LINE_HOUR = 8;
const NOON_LINE_HOUR = 13;
const EVENING_LINE_HOUR = 18;

export default memo(function MiniMap() {
    const { bounds, cards, expandCards, startHour, endHour, unconflicting } =
        useActiveScheduleResolved();
    const theme = useStore((store) => store.theme);
    const expandKey = useStore((store) => store.expandKey);

    const renderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );
    const visibleCards = renderingOptions.showConflicting
        ? cards
        : cards.filter((card) => unconflicting.has(card.section));

    const isExpandSelected: boolean =
        expandKey !== null &&
        cards.some((c) =>
            APIv4.compareSectionIdentifier(c.section.identifier, expandKey),
        );

    return (
        <div className={Css.minimapContainer}>
            <div className={Css.minimapLabelDay}>
                <span>{bounds.sunday ? "Sun" : "Mon"}</span>
                <span>{bounds.saturday ? "Sat" : "Fri"}</span>
            </div>
            <div
                className={Css.minimapLabelTime}
                style={{
                    gridTemplateRows: [...Array(24)]
                        .map((_, i) => {
                            // this loop looks very funny but is necessary for the time label animation.
                            // modification to grid-column is not animatable, only change in grid-template-column
                            // is animatable. so we have to set some columns to have a height of 0 instead of just
                            // changing the positions of the icons
                            if (i < startHour - 1) return 0;
                            if (i > endHour - 1) return 0;
                            return (
                                (100 / (endHour - startHour)).toString() + "%"
                            );
                        })
                        .join(" "),
                }}
            >
                <span
                    className={classNames(Css.startHour, {
                        [Css.hidden]: startHour + 1 >= MORNING_LINE_HOUR,
                    })}
                >
                    {startHour}am
                </span>
                <span
                    className={classNames(Css.endHour, {
                        [Css.hidden]: endHour - 1 <= EVENING_LINE_HOUR,
                    })}
                    style={{ gridRow: endHour }}
                >
                    {endHour - 12}pm
                </span>

                <div
                    className={classNames(Css.timeIconContainer, {
                        [Css.start]: startHour === MORNING_LINE_HOUR,
                    })}
                    style={{
                        gridRow: MORNING_LINE_HOUR,
                    }}
                >
                    <Feather.Sunrise className={Css.timeIcon} />
                </div>

                <div
                    className={Css.timeIconContainer}
                    style={{ gridRow: NOON_LINE_HOUR }}
                >
                    <Feather.Sun className={Css.timeIcon} />
                </div>

                <div
                    className={classNames(Css.timeIconContainer, {
                        [Css.end]: endHour === EVENING_LINE_HOUR,
                    })}
                    style={{
                        gridRow: EVENING_LINE_HOUR,
                    }}
                >
                    <Feather.Sunset className={Css.timeIcon} />
                </div>
            </div>
            <div className={Css.minimap}>
                <div
                    className={classNames(Css.grid, {
                        [Css.showSunday!]: bounds.sunday,
                        [Css.showSaturday!]: bounds.saturday,
                    })}
                    style={
                        {
                            "--start-hour": startHour,
                            "--end-hour": endHour,
                        } as React.CSSProperties
                    }
                >
                    <GridBackgroundColumns />

                    <div
                        className={classNames(Css.rowLine, {
                            [Css.hidden]: startHour === MORNING_LINE_HOUR,
                        })}
                        style={{ gridRow: MORNING_LINE_HOUR * 12 + 1 }}
                    />

                    <div
                        className={classNames(Css.rowLine)}
                        style={{ gridRow: NOON_LINE_HOUR * 12 + 1 }}
                    />
                    <div
                        className={classNames(Css.rowLine, {
                            [Css.hidden]: endHour === EVENING_LINE_HOUR,
                        })}
                        style={{ gridRow: EVENING_LINE_HOUR * 12 + 1 }}
                    />

                    {isExpandSelected ? (
                        <></>
                    ) : (
                        expandCards.map((card) => {
                            return (
                                <div
                                    key={`outline:${cardKey(card)}`}
                                    className={classNames(Css.expandOutline, {
                                        [Css.conflict]: visibleCards.some((c) =>
                                            cardOverlap(c, card),
                                        ),
                                    })}
                                    style={{
                                        gridColumn: card.day,
                                        gridRow: computeCardRows(card),
                                        ...sectionColorStyle(
                                            card.section.identifier,
                                            theme,
                                            true,
                                        ),
                                    }}
                                ></div>
                            );
                        })
                    )}
                    <MinimapCards cards={cards} unconflicting={unconflicting} />
                </div>
            </div>
        </div>
    );
});

const MinimapCards = memo(function MinimapCards(props: {
    cards: Card[];
    unconflicting: Set<APIv4.Section>;
}) {
    const byDay = groupCardsByDay(props.cards);

    return (
        <>
            {Object.entries(byDay).flatMap(([day, cards]) =>
                mergeCards(cards).flatMap((group) => {
                    return group.cards
                        .sort(comparePriority)
                        .map((card, i) => (
                            <Card
                                key={`${APIv4.stringifySectionCodeLong(
                                    card.section.identifier,
                                )}:${card.startTime}/${card.endTime}/${day}`}
                                card={card}
                                index={i}
                                isUnconflicting={props.unconflicting.has(
                                    card.section,
                                )}
                                groupSize={group.cards.length}
                            />
                        ));
                }),
            )}
        </>
    );
});

const Card = memo(function Card(props: {
    card: Card;
    isUnconflicting: boolean;
    index: number;
    groupSize: number;
}) {
    const setPopup = useStore((store) => store.setPopup);
    const setHoverSection = useStore((store) => store.setHoverSection);
    const hoverSection = useStore((store) => store.hoverSection);
    const renderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );

    const theme = useStore((store) => store.theme);
    const expandKey = useStore((store) => store.expandKey);

    const sectionCode = APIv4.stringifySectionCodeLong(
        props.card.section.identifier,
    );

    let marginLeft: string = `${(props.index / props.groupSize) * 100}%`;
    let marginRight: string;
    let visibility: "hidden" | undefined;

    if (renderingOptions.showConflicting) {
        marginRight = `${
            ((props.groupSize - props.index - 1) / props.groupSize) * 100
        }%`;
    } else {
        if (props.isUnconflicting) {
            const half = props.card.section.identifier.half;

            if (half !== null) {
                if (half.number === 1) {
                    marginLeft = "0";
                    marginRight = "50%";
                } else {
                    marginLeft = "50%";
                    marginRight = "0";
                }
            } else {
                marginLeft = "0";
                marginRight = "0";
            }
        } else {
            marginRight = `${(1 - props.index / props.groupSize) * 100}%`;
            visibility = "hidden";
        }
    }
    return (
        <div
            className={classNames(Css.slice, {
                [Css.hover]:
                    hoverSection !== null &&
                    APIv4.compareSectionIdentifier(
                        hoverSection,
                        props.card.section.identifier,
                    ),
                [Css.highlight]:
                    expandKey &&
                    sectionCode === APIv4.stringifySectionCodeLong(expandKey),
            })}
            style={{
                marginLeft,
                marginRight,
                visibility,
                gridColumn: props.card.day,
                gridRow: computeCardRows(props.card),
                ...sectionColorStyle(
                    props.card.section.identifier,
                    theme,
                    true,
                ),
            }}
            onClick={() => {
                setPopup({
                    option: PopupOption.SectionDetail,
                    section: props.card.section.identifier,
                });
            }}
            onPointerEnter={() =>
                setHoverSection(props.card.section.identifier)
            }
            onPointerLeave={() => setHoverSection(null)}
        ></div>
    );
});
