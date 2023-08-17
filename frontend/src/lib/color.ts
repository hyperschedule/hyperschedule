import * as APIv4 from "hyperschedule-shared/api/v4";
import randomColor from "randomcolor";
import md5 from "md5";
import { Theme } from "@hooks/store";

interface SectionCSSProperties extends React.CSSProperties {
    "--section-color": string;
    "--section-shadow": string;
}

type Color = [number, number, number];

// implementing https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
export function hslToHsv(c: Color): Color {
    const [h, sl, l] = c;
    const v = l + sl * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return [h, sv, v];
}

export function hsvToHsl(c: Color): Color {
    const [h, sv, v] = c;
    const l = v * (1 - sv / 2);
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return [h, sl, l];
}

function hslArrayToCssString(color: Color, alpha: number = 1) {
    let [h, s, l] = color;
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h},${s}%,${l}%,${alpha})`;
}

function computeShadowColor(c: Color): Color {
    const [h, s, v] = c;
    return [Math.abs(180 - h), s, v * 0.5];
}

export function sectionColorStyle(
    section: APIv4.SectionIdentifier,
    theme: Theme,
): SectionCSSProperties {
    // the types published for this package is wrong,
    // actual output is formatted as [H (0-360), S (0-100), V (0-100)]
    const colorOut = randomColor({
        hue: "random",
        luminosity: "light",
        seed: md5(APIv4.stringifySectionCode(section)),
        format: "hsvArray",
    }) as unknown as Color;

    let color: Color;
    if (theme === Theme.Light) {
        color = [colorOut[0], colorOut[1] / 100, colorOut[2] / 100];
    } else {
        color = [colorOut[0], colorOut[1] / 100, (colorOut[2] / 100) * 0.6];
    }
    return {
        "--section-color": hslArrayToCssString(hsvToHsl(color)),
        "--section-shadow": hslArrayToCssString(
            hsvToHsl(computeShadowColor(color)),
        ),
    };
}
