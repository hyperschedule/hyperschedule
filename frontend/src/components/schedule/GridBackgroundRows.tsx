import Css from "./GridBackgroundRows.module.css";
import { memo } from "react";

export default memo(function GridBackgroundRows() {
    const gridLines: JSX.Element[] = [];
    for (let i = 0; i < 24; ++i)
        gridLines.push(
            <div
                key={i}
                className={Css.gridLine}
                style={{ "--hour": i } as React.CSSProperties}
            />,
        );

    return <>{gridLines}</>;
});
