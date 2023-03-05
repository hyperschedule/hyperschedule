import { describe, expect, test } from "@jest/globals";
import {
    NoTransform,
    parseJSON,
    parseJSONItem,
    Remove,
} from "../../src/hmc-api/parser/json";
import type { SafeParseSuccess } from "zod";
import { z } from "zod";

describe("hmc-api/parser/json.ts", () => {
    test("Single json item parsing without transform", () => {
        const out = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.string() }).strict(),
            {
                a: NoTransform,
                b: NoTransform,
            },
        );
        expect(out.success).toBeFalsy();

        const out2 = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.number() }).strict(),
            {
                a: NoTransform,
                b: NoTransform,
            },
        );
        expect(out2.success).toBeTruthy();
        expect((out2 as SafeParseSuccess<unknown>).data).toStrictEqual({
            a: 1,
            b: 2,
        });
    });

    test("Single json item parsing with extra field", () => {
        const out = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number() }).strict(),
            {
                a: NoTransform,
                b: Remove,
            },
        );
        expect(out.success).toBeTruthy();
    });

    test("Single json item parsing with value transform", () => {
        const out = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.string() }).strict(),
            {
                a: NoTransform,
                b(v: number) {
                    return {
                        name: "b",
                        value: v.toString(),
                    };
                },
            },
        );
        expect(out.success).toBeTruthy();
        expect((out as SafeParseSuccess<unknown>).data).toStrictEqual({
            a: 1,
            b: "2",
        });
    });

    test("Single json item parsing with key rename transform", () => {
        const out = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), c: z.string() }).strict(),
            {
                a: NoTransform,
                b(v: number) {
                    return {
                        name: "c",
                        value: v.toString(),
                    };
                },
            },
        );
        expect(out.success).toBeTruthy();
        expect((out as SafeParseSuccess<unknown>).data).toStrictEqual({
            a: 1,
            c: "2",
        });
    });

    test("Single json item parsing with incorrect transform", () => {
        const out = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.number() }).strict(),
            {
                a: NoTransform,
                b(v: number) {
                    return {
                        name: "a",
                        value: v,
                    };
                },
            },
        );
        expect(out.success).toBeFalsy();

        const out2 = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.number() }).strict(),
            {
                a: NoTransform,
                // @ts-expect-error non-existent key c
                b(v: number) {
                    return {
                        name: "c",
                        value: v,
                    };
                },
            },
        );
        expect(out2.success).toBeFalsy();

        const out3 = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.number(), b: z.number() }).strict(),
            {
                a: NoTransform,
                // @ts-expect-error wrong return type for v
                b(v: number) {
                    return {
                        name: "b",
                        value: v.toString(),
                    };
                },
            },
        );
        expect(out3.success).toBeFalsy();

        const out4 = parseJSONItem(
            { a: 1, b: 2 },
            z.object({ a: z.string(), b: z.boolean() }).strict(),
            {
                a: NoTransform,
                b(v: number) {
                    return {
                        name: "b",
                        value: v.toString(),
                    };
                },
            },
        );
        expect(out4.success).toBeFalsy();

        const out5 = parseJSONItem(
            { a: 1, b: 2, c: 5 },
            z.object({ a: z.string(), b: z.boolean() }).strict(),
            {
                a: NoTransform,
                b(v: number) {
                    return {
                        name: "b",
                        value: v.toString(),
                    };
                },
                c: NoTransform,
            },
        );
        expect(out5.success).toBeFalsy();
    });

    test("zod validator has to be strict", () => {
        const result = parseJSONItem(
            { a: 1, b: 2 },
            // @ts-expect-error z.object is not in strict mode
            z.object({ a: z.number() }),
            {
                a: Remove,
                b: Remove,
            },
        );
        expect(result.success).toBeFalsy();
    });

    test("JSON array parsing", () => {
        const testInput = [
            {
                a: "1",
                b: "2",
            },
            { a: "3", b: "4" },
        ];
        const expectedOutput = [
            {
                a: "1",
                b: 2,
            },
            { a: "3", b: 4 },
        ];
        const result = parseJSON(
            testInput,
            z.object({ a: z.string(), b: z.number() }).strict(),
            {
                a: NoTransform,
                b: (v) => ({
                    name: "b",
                    value: parseInt(v),
                }),
            },
        );
        expect(result).toStrictEqual(expectedOutput);
    });
});
