import classNames from "classnames";

import Css from "./GridBackgroundColumns.module.css";

import { dayOrder } from "@lib/schedule";
import { memo } from "react";

export default memo(function GridBackground() {
    return (
        <>
            {dayOrder.map((day, i) => (
                <div
                    key={`day:${day}`}
                    className={classNames(Css.dayBackground, {
                        // bullshit !: <https://github.com/facebook/create-react-app/issues/11156>
                        [Css.odd!]: i & 1,
                    })}
                    style={{ gridColumn: day }}
                ></div>
            ))}
        </>
    );
});
