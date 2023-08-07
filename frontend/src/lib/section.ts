import * as APIv4 from "hyperschedule-shared/api/v4";
import randomColor from "randomcolor";
import md5 from "md5";

interface SectionCSSProperties extends React.CSSProperties {
    "--section-color-light": string;
}

export function sectionColor(section: APIv4.SectionIdentifier) {
    return randomColor({
        hue: "random",
        luminosity: "light",
        seed: md5(APIv4.stringifySectionCode(section)),
        format: "hex",
    });
}

export function sectionColorStyle(
    section: APIv4.SectionIdentifier,
): SectionCSSProperties {
    return {
        "--section-color-light": sectionColor(section),
    };
}
