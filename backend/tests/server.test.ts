import { describe, test, expect, afterAll } from "@jest/globals";
import request from "supertest";
import { server as app } from "../src/server";
import { updateSections } from "../src/db/models/course";
import { setupDbHooks } from "./db/hooks";
import { testSectionV4, testSectionV3 } from "./test-data";
import { CURRENT_TERM } from "../src/current-term";

setupDbHooks();

const server = app.listen();
const mockServer = request(server);

afterAll(() => {
    server.close();
});

describe("Course routes", () => {
    test("Route /v4/sections", async () => {
        await updateSections([testSectionV4], CURRENT_TERM);
        const resp = await mockServer.get("/v4/sections");
        expect(resp.status).toEqual(200);
        // it's fine if content type is like "application/json; charset=utf-8" or "text/json"
        expect(resp.headers["content-type"]).toMatch(/json/);
        expect(resp.body).toStrictEqual([testSectionV4]);
    });

    test("Route /v3/sections", async () => {
        await updateSections([testSectionV4], CURRENT_TERM);
        const resp = await mockServer.get("/v3/courses");
        expect(resp.status).toEqual(200);
        // it's fine if content type is like "application/json; charset=utf-8" or "text/json"
        expect(resp.headers["content-type"]).toMatch(/json/);
        expect(resp.body).toStrictEqual({
            data: { terms: {}, courses: [testSectionV3] },
        });
    });
});
