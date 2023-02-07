import { describe, test, expect } from "@jest/globals";
import { endpoints } from "../src/hmc-api/fetcher/endpoints";
import { CourseFiles } from "../src/hmc-api/course";

describe("src/hmc-api/fetcher/endpoints.ts", () => {
    test("Endpoints contain exactly one copy of everything", () => {
        const keys = Object.fromEntries(
            CourseFiles.keyof().options.map((v) => [v, 0]),
        ) as Record<keyof CourseFiles, number>;
        for (let e of endpoints) keys[e.for] += 1;

        for (let v of Object.values(keys)) expect(v).toEqual(1);
    });
});
