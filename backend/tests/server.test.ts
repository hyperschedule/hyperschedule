import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { server } from "../src/server";
import { updateSections } from "../src/db/models/course";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { setupDbHooks } from "./db/hooks";
import { testSectionV4, testSectionV3 } from "./test-data";
import { CURRENT_TERM } from "../src/current-term";

setupDbHooks();

const mockServer = request(server.listen());

describe("Course routes", () => {
    test("Route /v4/sections", async () => {
        await updateSections(
            [testSectionV4],
            APIv4.parseTermIdentifier(CURRENT_TERM),
        );
        const resp = await mockServer.get("/v4/sections");
        expect(resp.status).toEqual(200);
        // it's fine if content type is like "application/json; charset=utf-8" or "text/json"
        expect(resp.headers["content-type"]).toMatch(/json/);
        expect(resp.body).toStrictEqual([testSectionV4]);
    });

    test("Route /v3/sections", async () => {
        await updateSections(
            [testSectionV4],
            APIv4.parseTermIdentifier(CURRENT_TERM),
        );
        const resp = await mockServer.get("/v3/courses");
        expect(resp.status).toEqual(200);
        // it's fine if content type is like "application/json; charset=utf-8" or "text/json"
        expect(resp.headers["content-type"]).toMatch(/json/);
        expect(resp.body).toStrictEqual({
            data: { terms: {}, courses: [testSectionV3] },
        });
    });
});
