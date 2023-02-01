import * as Zod from "zod";

export const enum Method {
    Get = 0,
    PostJson = 1,
}

type PathParams<Path extends string> = Path extends `${infer A}/${infer B}`
    ? PathParams<A> | PathParams<B>
    : Path extends `:${infer Param}`
    ? Param
    : never;

type ParamsSchema<Path extends string> = Record<
    PathParams<Path>,
    Zod.ZodTypeAny
>;

export interface EndpointGet<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
> {
    path: Path;
    schema: {
        params: Params;
        query: Query;
        response: Response;
    };
}

export interface EndpointPostJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends Zod.ZodTypeAny,
    Body extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
> {
    path: Path;
    schema: {
        params: Params;
        query: Query;
        body: Body;
        response: Response;
    };
}

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
> = keyof Params extends PathParams<Path>
    ? Params
    : Params &
          [
              {
                  typeError: "params schema contains extraneous keys not declared in path";
                  schemaKeys: keyof Params;
                  pathKeys: PathParams<Path>;
              },
              never,
          ];

export function get<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
>(
    path: Path,
    schema: {
        params: CheckParams<Path, Params>;
        query: Query;
        response: Response;
    },
): EndpointGet<Path, Params, Query, Response> {
    return { path, schema };
}

export function postJson<
    Path extends string,
    Params extends ParamsSchema<Path>,
    Query extends Zod.ZodTypeAny,
    Body extends Zod.ZodTypeAny,
    Response extends Zod.ZodTypeAny,
>(
    path: Path,
    schema: {
        params: CheckParams<Path, Params>;
        query: Query;
        body: Body;
        response: Response;
    },
): EndpointPostJson<Path, Params, Query, Body, Response> {
    return { path, schema };
}
