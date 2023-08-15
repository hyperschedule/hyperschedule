import Css from "./MiniMap.module.css";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useActiveScheduleResolved } from "@hooks/schedule";
import useStore from "@hooks/store";

import { sectionColorStyle } from "@lib/section";

import GridBackgroundColumns from "@components/schedule/GridBackgroundColumns";

import classNames from "classnames";

import { cardKey, mergeCards, groupCardsByDay, timeHull } from "@lib/schedule";

export default function MiniMap() {
    const { bounds, cards, expandCards, startHour, endHour } =
        useActiveScheduleResolved();

    const setExpandKey = useStore((store) => store.setExpandKey);
    const clearExpand = useStore((store) => store.clearExpand);

    const byDay = groupCardsByDay(cards);

    return (
        <div className={Css.minimapContainer}>
            <div className={Css.minimapLabelDay}>
                <span>{bounds.sunday ? "Sun" : "Mon"}</span>
                <span>{bounds.saturday ? "Sat" : "Fri"}</span>
            </div>
            <div className={Css.minimapLabelTime}>
                <span>{startHour}am</span>
                <span>{endHour - 12}pm</span>
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
                    {expandCards.map((card) => (
                        <div
                            key={`outline:${cardKey(card)}`}
                            className={Css.expandOutline}
                            style={{
                                gridColumn: card.day,
                                gridRow: `${
                                    Math.floor(card.startTime / 300) + 1
                                } / ${Math.floor(card.endTime / 300) + 1}`,
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
                                            Math.round(hull.startTime / 300) + 1
                                        } / ${
                                            Math.round(hull.endTime / 300) + 1
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
