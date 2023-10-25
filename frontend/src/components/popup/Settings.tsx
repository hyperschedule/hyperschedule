import Css from "./Settings.module.css";
import Slider from "@components/common/Slider";
import useStore from "@hooks/store";

export function Settings() {
    const options = useStore((store) => store.appearanceOptions);
    const setOptions = useStore((store) => store.setAppearanceOptions);

    return (
        <div>
            <h2>Settings</h2>
            <Slider
                value={options.disableShadows}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableShadows: !options.disableShadows,
                    })
                }
                text="Disable Shadows"
            />
            <Slider
                value={options.disableTransparency}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableTransparency: !options.disableTransparency,
                    })
                }
                text="Disable Transparency"
            />
            <Slider
                value={options.disableRoundedCorners}
                onToggle={() =>
                    setOptions({
                        ...options,
                        disableRoundedCorners: !options.disableRoundedCorners,
                    })
                }
                text="Disable Rounded Corners"
            />
        </div>
    );
}
