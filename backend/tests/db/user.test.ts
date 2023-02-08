import { setupDbHooks } from "./hooks";
import { describe, test } from "vitest";

setupDbHooks();

describe("db/models/user", () => {
    test("user creation", () => {});
});
