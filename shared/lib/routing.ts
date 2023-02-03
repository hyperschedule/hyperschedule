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
type PathParamKeys<Path extends string> = Path extends `${infer A}/${infer B}`
    ? PathParamKeys<A> | PathParamKeys<B>
    : Path extends `:${infer Param}`
    ? Param
    : never;

type ParamsSchema<Path extends string> = Record<
    PathParamKeys<Path>,
    Zod.ZodTypeAny
>;

type QuerySchema = Record<string, Zod.ZodTypeAny>;

/**
Make `params` argument optional in schema if and only if `Path` doesn't
declare any parameter keys
*/
type OptionalParams<
    Path extends string,
    Params extends ParamsSchema<Path>,
> = PathParamKeys<Path> extends never
    ? { readonly params?: Params }
    : { readonly params: Params };

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

export interface EndpointGet<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Response extends Zod.ZodTypeAny,
> {
    readonly method: Method.Get;
    readonly path: Path;
    readonly schema: OptionalParams<Path, CheckParams<Path, Params>> & {
        readonly query?: Query;
        readonly response?: Response;
    };
}

export interface EndpointPostJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Body extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
> {
    readonly method: Method.PostJson;
    readonly path: Path;
    readonly schema: OptionalParams<Path, CheckParams<Path, Params>> & {
        readonly query?: Query;
        readonly body?: Body;
        readonly response?: Response;
    };
}

export function get<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Response extends Zod.ZodTypeAny,
>(
    path: Path,
    schema: OptionalParams<Path, CheckParams<Path, Params>> & {
        readonly query?: Query;
        readonly response?: Response;
    },
): EndpointGet<Path, Params, Query, Response> {
    return { method: Method.Get, path, schema };
}

export function postJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends QuerySchema,
    Body extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
>(
    path: Path,
    schema: OptionalParams<Path, CheckParams<Path, Params>> & {
        readonly query?: Query;
        readonly body?: Body;
        readonly response?: Response;
    },
): EndpointPostJson<Path, Params, Query, Body, Response> {
    return { method: Method.PostJson, path, schema };
}
