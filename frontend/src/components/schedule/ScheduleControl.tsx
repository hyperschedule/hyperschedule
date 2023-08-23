import Css from "./ScheduleControl.module.css";
import useStore from "@hooks/store";

export default function ScheduleControl() {
    const options = useStore((store) => store.scheduleRenderingOptions);
    const setOptions = useStore((store) => store.setScheduleRenderingOptions);

    return (
        <div className={Css.control}>
            <label>
                <input
                    type="checkbox"
                    checked={options.hideConflicting}
                    onChange={() =>
                        setOptions({
                            hideConflicting: !options.hideConflicting,
                            hideStatus: options.hideStatus,
                        })
                    }
                />{" "}
                hide conflicting sections
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={options.hideStatus}
                    onChange={() =>
                        setOptions({
                            hideConflicting: options.hideConflicting,
                            hideStatus: !options.hideStatus,
                        })
                    }
                />{" "}
                hide status
            </label>
        </div>
    );
}
