import * as APIv4 from "hyperschedule-shared/api/v4";
import randomColor from "randomcolor";
import md5 from "md5";
import { Theme } from "@hooks/store";

interface SectionCSSProperties extends React.CSSProperties {
    "--section-color": string;
    "--section-highlight": string;
    "--section-shadow": string;
}

// an array in hue (0-360), saturation (0-1), value/lightness (0-1)
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

/**************************************************
 * see all the brightness changing functions here
 * https://www.desmos.com/calculator/c7lr4x2qxm
 *
 * most of the constants here are chosen somewhat
 * arbitrarily for a nice curve that still satisfies
 * the bounds.
 **************************************************/
function scaledown(x: number) {
    // assuming 0<=x<=1
    // this computes e^(1.25x-2) - e^(-2)
    return Math.exp(1.25 * x - 2) - 0.135335283237;
}

function scaleup(x: number) {
    // assuming 0<=x<=1
    // this computes 1.3 - e^(-1.25x+1/3)
    return 1.4 - Math.exp(-1.25 * x + 0.333333333);
}

function invScaleup(x: number) {
    // assuming 0<=x<=1
    // computes 4/15 - 0.8 ln(1.4 - x), the inverse function of scaleup
    return 0.266666667 - 0.8 * Math.log(1.4 - x);
}

function computeShadowColor(c: Color): Color {
    const [h, s, v] = c;
    return [h, scaledown(s), scaledown(v)];
}

function computeHighlightColor(c: Color, theme: Theme): Color {
    const [h, s, v] = c;
    if (theme === Theme.Dark) return [h, invScaleup(s), scaleup(v)];

    return [h, scaleup(s), invScaleup(v)];
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
        "--section-highlight": hslArrayToCssString(
            hsvToHsl(computeHighlightColor(color, theme)),
        ),
        "--section-shadow": hslArrayToCssString(
            hsvToHsl(computeShadowColor(color)),
        ),
    };
}
