import * as Z from "zod";

type JsonValue =
    | boolean
    | number
    | string
    | null
    | JsonValue[]
    | { [_: string]: JsonValue };

export type MethodSchemaGetAny = {
    readonly return: Z.ZodType<JsonValue | void>;
    readonly status: number;
};

export type MethodSchemaPost<_ extends "post" | "patch" | "delete" | "put"> = {
    readonly body: Z.ZodType<JsonValue>;
    readonly return: Z.ZodType<JsonValue | void>;
    readonly status: number;
};

export type MethodsSchemaAny = {
    readonly get?: MethodSchemaGetAny;
    readonly post?: MethodSchemaPost<"post">;
    readonly put?: MethodSchemaPost<"put">;
    readonly patch?: MethodSchemaPost<"patch">;
    readonly delete?: MethodSchemaPost<"delete">;
};

export type MethodSchemaPostAny = MethodSchemaPost<"post" | "patch" | "delete">;

export type MethodSchemaAny = MethodSchemaGetAny | MethodSchemaPostAny;

export type RouteSchema<
    Path extends `/${string}`,
    Methods extends MethodsSchemaAny,
> = {
    readonly path: Path;
    readonly methods: Methods;
};

export type RouteSchemaAny = RouteSchema<`/${string}`, MethodsSchemaAny>;

type MethodKey<
    Methods extends MethodsSchemaAny,
    Type extends MethodSchemaGetAny | MethodSchemaPostAny,
    Key extends "get" | "post" | "patch" | "delete" | "put",
> = Methods[Key] extends Type
    ? Key extends keyof Methods
        ? Key
        : never
    : never;

export type MethodKeys<Schema extends MethodsSchemaAny> =
    | MethodKey<Schema, MethodSchemaGetAny, "get">
    | MethodKey<Schema, MethodSchemaPostAny, "post">
    | MethodKey<Schema, MethodSchemaPostAny, "patch">
    | MethodKey<Schema, MethodSchemaPostAny, "put">
    | MethodKey<Schema, MethodSchemaPostAny, "delete">;

export type RouteMethods<Schema extends RouteSchemaAny> = MethodKeys<
    Schema["methods"]
>;

export function route<
    Path extends `/${string}`,
    Methods extends MethodsSchemaAny,
>(path: Path, methods: Methods): RouteSchema<Path, Methods> {
    return { path, methods };
}

export type MethodReturn<Schema extends MethodSchemaAny> = Z.TypeOf<
    Schema["return"]
>;

export type MethodFetchGet<Schema extends MethodSchemaGetAny> = () => Promise<
    Z.TypeOf<Schema["return"]>
>;
export type MethodFetchPost<Schema extends MethodSchemaPostAny> = (
    body: Z.TypeOf<Schema["body"]>,
) => Promise<Z.TypeOf<Schema["return"]>>;

export type MethodFetch<Schema extends MethodSchemaAny> =
    Schema extends MethodSchemaPostAny
        ? MethodFetchPost<Schema>
        : Schema extends MethodSchemaGetAny
        ? MethodFetchGet<Schema>
        : never;

export type RouteFetch<
    Schema extends RouteSchemaAny,
    Method extends RouteMethods<Schema>,
> = Schema["methods"][Method] extends MethodSchemaAny
    ? MethodFetch<Schema["methods"][Method]>
    : () => never;
