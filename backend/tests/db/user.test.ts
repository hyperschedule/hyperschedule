import { setupDbHooks } from "./hooks";
import { describe, test } from "@jest/globals";

setupDbHooks();

describe("db/models/user", () => {
    test("user creation", () => {});
});
