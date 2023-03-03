import { describe, test, expect } from "@jest/globals";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { computeParams } from "../../src/hmc-api/fetcher/utils";

describe("src/hmc-api/fetcher/utils.ts", () => {
    test("computeParams", () => {
        expect(
            computeParams({
                year: 2023,
                term: APIv4.Term.spring,
            }),
        ).toEqual({
            year: "2023",
            catalog: "UG22",
            session: "SP",
        });

        expect(
            computeParams({
                year: 2023,
                term: APIv4.Term.summer,
            }),
        ).toEqual({
            year: "2023",
            catalog: "UG22",
            session: "SU",
        });

        expect(
            computeParams({
                year: 2023,
                term: APIv4.Term.fall,
            }),
        ).toEqual({
            year: "2023",
            catalog: "UG23",
            session: "FA",
        });
    });
});
