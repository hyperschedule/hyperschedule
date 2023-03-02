import { describe, test, expect } from "@jest/globals";
import { fixEncoding } from "../../src/hmc-api/encoding";

describe("src/hmc-api/encoding.ts", () => {
    test("encoding fix works with correctly encoded data", () => {
        expect(fixEncoding("some test data")).toEqual("some test data");
        expect(fixEncoding("🏳️‍⚧️")).toEqual("🏳️‍⚧️");
    });

    test("encoding fix works with double utf8 encoded data", () => {
        expect(fixEncoding("â\x80\x99")).toEqual("’");
    });

    test("encoding fix works with utf8 then windows-1252 encoded data", () => {
        expect(fixEncoding("\x92")).toEqual("’");
    });

    test("some example data from actual course title/description", () => {
        expect(fixEncoding("ThÃ­ch Nháº¥t Háº¡nh")).toEqual("Thích Nhất Hạnh");
        expect(fixEncoding("âpoliticalâ")).toEqual("“political”");
        expect(fixEncoding(""));
    });
});
