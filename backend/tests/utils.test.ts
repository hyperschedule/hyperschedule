import { describe, test, expect } from "@jest/globals";
import { mergeArrays } from "../src/utils";

describe("Backend utils", () => {
    test("mergeArrays", () => {
        const arr1 = mergeArrays([[1], [2], [3], [4]]);
        expect(arr1).toEqual([1, 2, 3, 4]);

        const arr2 = mergeArrays([
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8],
        ]);
        expect(arr2).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
});
