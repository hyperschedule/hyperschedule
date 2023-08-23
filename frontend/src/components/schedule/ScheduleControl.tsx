import Css from "./ScheduleControl.module.css";
import useStore from "@hooks/store";
import html2canvas from "html2canvas";
import { scheduleContainerId } from "@lib/constants";

async function downloadImage() {
    const el = document.querySelector(
        "#" + scheduleContainerId,
    ) as HTMLDivElement;
    const canvas = await html2canvas(el, {
        windowWidth: 1920,
        windowHeight: 1080,
    });
    const url = canvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

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
            <button onClick={() => void downloadImage()}>
                download schedule image
            </button>
        </div>
    );
}
