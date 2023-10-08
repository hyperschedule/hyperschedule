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
                            showDetails: options.showDetails,
                        })
                    }
                />{" "}
                hide conflicting sections
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={options.showDetails}
                    onChange={() =>
                        setOptions({
                            hideConflicting: options.hideConflicting,
                            showDetails: !options.showDetails,
                        })
                    }
                />{" "}
                show details
            </label>
            <button onClick={() => void downloadImage()}>
                download schedule image
            </button>
        </div>
    );
}
