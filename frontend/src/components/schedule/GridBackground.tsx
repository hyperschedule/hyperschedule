import classNames from "classnames";

import * as APIv4 from "hyperschedule-shared/api/v4";

import Css from "./GridBackground.module.css";

const dayOrder = [
    APIv4.Weekday.sunday,
    APIv4.Weekday.monday,
    APIv4.Weekday.tuesday,
    APIv4.Weekday.wednesday,
    APIv4.Weekday.thursday,
    APIv4.Weekday.friday,
    APIv4.Weekday.saturday,
] as const;

export default function GridBackground() {
    return (
        <>
            {dayOrder.map((day, i) => (
                <div
                    key={`day:${day}`}
                    className={classNames(Css.dayBackground, {
                        [Css.odd]: i & 1,
                    })}
                    style={{ gridColumn: day }}
                ></div>
            ))}
        </>
    );
}
