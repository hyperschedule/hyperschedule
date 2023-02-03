import * as Zod from "zod";

export const enum Method {
    Get = 0,
    PostJson = 1,
}

/**
Infer path parameter names from express-style routing path, e.g.:

```typescript
PathParamKeys<"sections/:term/:year"> = "term"|"year"
```
*/
export type PathParamKeys<Path extends string> =
    Path extends `${infer A}/${infer B}`
        ? PathParamKeys<A> | PathParamKeys<B>
        : Path extends `:${infer Param}`
        ? Param
        : never;

export type ParamsSchema<Path extends string> = Record<
    PathParamKeys<Path>,
    Zod.ZodTypeAny
>;

export type QuerySchema = Record<string, Zod.ZodTypeAny>;

export type OutputSchema = Record<number, Zod.ZodTypeAny> & {
    200: Zod.ZodTypeAny;
};

// TypeScript's `extends` constraint is a "one-way" subtyping constraint:
// requiring `Params extends ParamsSchema<Path>` ensures that every parameter
// included in `Path` is declared in the `Params` record, but it doesn't prevent
// `Params` from having extraneous keys not appearing in the path. This
// `CheckParams` type performs the reverse check: if every key in `Params` is
// accounted for in `Path`, then return `Params` as-is; otherwise return a
// never-instantiate-able type along with an error message explaining the cause.
//
// In an ideal world, TypeScript generic constraints would support "exact"
// rather than subtype matching; however, until then, this is our best
// approximation to it.
type CheckParams<
    Path extends string,
    Params extends ParamsSchema<Path>,
> = keyof Params extends PathParamKeys<Path>
    ? Params
    : Params &
          [
              {
                  typeError: "params schema contains extraneous keys not declared in path";
                  schemaKeys: keyof Params;
                  pathKeys: PathParamKeys<Path>;
              },
              never,
          ];

interface BaseInputSchema<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
> {
    readonly param: Zod.ZodObject<CheckParams<Path, Params>>;
    readonly query: Zod.ZodObject<Query>;
}

export interface EndpointGet<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Output extends OutputSchema,
> {
    readonly method: Method.Get;
    readonly path: Path;
    readonly input: BaseInputSchema<Path, Params, Query>;
    readonly output: Output;
}
export type EndpointGetAny = EndpointGet<
    string,
    {},
    {},
    { 200: Zod.ZodTypeAny }
>;

export interface EndpointPostJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Body extends Zod.ZodTypeAny,
    Output extends OutputSchema,
> {
    readonly method: Method.PostJson;
    readonly path: Path;
    readonly input: BaseInputSchema<Path, Params, Query> & {
        readonly body: Body;
    };
    readonly output: Output;
}
export type EndpointPostJsonAny = EndpointPostJson<
    string,
    {},
    {},
    Zod.ZodTypeAny,
    { 200: Zod.ZodTypeAny }
>;

export type EndpointAny = EndpointGetAny | EndpointPostJsonAny;

export const enum ModuleType {
    Parent = 0,
    Endpoints = 1,
}

export interface ModuleParent<Modules extends Record<string, ModuleAny>> {
    readonly type: ModuleType.Parent;
    readonly modules: Modules;
}
export type ModuleParentAny = ModuleParent<Record<string, ModuleAny>>;

export interface ModuleEndpoints<
    Endpoints extends Record<string, EndpointAny>,
> {
    readonly type: ModuleType.Endpoints;
    readonly endpoints: Endpoints;
}
export type ModuleEndpointsAny = ModuleEndpoints<Record<string, EndpointAny>>;

export type ModuleAny = ModuleParentAny | ModuleEndpointsAny;

/**
dev API convenience: make `param` argument optional in schema if and only
if `Path` doesn't declare any parameter keys
*/
type OptionalParams<
    Path extends string,
    Params extends ParamsSchema<Path>,
> = PathParamKeys<Path> extends never
    ? { readonly param?: Params }
    : { readonly param: Params };

/**
dev API convenience: make `query` argument optional if and only if
`Query` type parameter is empty record type
*/
type OptionalQuery<Query extends QuerySchema> = {} extends Query
    ? { readonly query?: Query }
    : { readonly query: Query };

function compileInput<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
>(
    input: OptionalParams<Path, CheckParams<Path, Params>> &
        OptionalQuery<Query>,
): BaseInputSchema<Path, Params, Query> {
    return {
        // typecast soundness: `OptionalParams` ensures that `schema.param`
        // may be undefined only when `Path` declares no parameter keys
        param: Zod.object(input.param ?? ({} as CheckParams<Path, Params>)),

        // typecast soundness: `OptionalQuery` ensures that `schema.query`
        // may be undefined only when `Query` is the empty record type
        query: Zod.object(input.query ?? ({} as Query)),
    };
}

export function get<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Output extends OutputSchema,
>(
    path: Path,
    input: OptionalParams<Path, CheckParams<Path, Params>> &
        OptionalQuery<Query>,
    output: Output,
): EndpointGet<Path, Params, Query, Output> {
    return {
        method: Method.Get,
        path,
        input: compileInput(input),
        output,
    };
}

export function postJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Body extends Zod.ZodTypeAny,
    Output extends OutputSchema,
>(
    path: Path,
    input: OptionalParams<Path, CheckParams<Path, Params>> &
        OptionalQuery<Query> & { readonly body: Body },
    output: Output,
): EndpointPostJson<Path, Params, Query, Body, Output> {
    return {
        method: Method.PostJson,
        path,
        input: { ...compileInput(input), body: input.body },
        output,
    };
}

export function substitutePath<Path extends string>(
    path: Path,
    args: Record<PathParamKeys<Path>, string>,
): string {
    return path
        .split("/")
        .map((part) =>
            part.startsWith(":")
                ? args[part.slice(1) as PathParamKeys<Path>]
                : part,
        )
        .join("/");
}

export function modules<Modules extends Record<string, ModuleAny>>(
    modules: Modules,
): ModuleParent<Modules> {
    return { type: ModuleType.Parent, modules };
}

export function endpoints<Endpoints extends Record<string, EndpointAny>>(
    endpoints: Endpoints,
): ModuleEndpoints<Endpoints> {
    return { type: ModuleType.Endpoints, endpoints };
}
