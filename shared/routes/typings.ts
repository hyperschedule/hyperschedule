import type * as Zod from "zod";

export const enum Method {
    Get = 0,
    Post = 1,
}

export type Payload = Record<string, Zod.ZodTypeAny>;

export type PayloadType<P extends Payload> = {
    [K in keyof P]: Zod.TypeOf<P[K]>;
};

export interface Endpoint<
    Input extends Payload,
    Output extends Zod.ZodTypeAny,
> {
    method: Method;
    input: Input;
    output: Output;
}

export const enum RouteType {
    Endpoint = 0,
    Nested = 1,
}

export interface RouteEndpoint<
    Input extends Payload,
    Output extends Zod.ZodTypeAny,
> {
    type: RouteType.Endpoint;
    endpoint: Endpoint<Input, Output>;
}

export interface RouteNested<Routes extends RoutesAny> {
    type: RouteType.Nested;
    routes: Routes;
}

export type RouteAny =
    | RouteEndpoint<Payload, Zod.ZodTypeAny>
    | RouteNested<RoutesAny>;

export interface RoutesAny {
    [Segment: string]: RouteAny;
}

export namespace Server {
    type Handler<Route extends RouteAny> = Route extends RouteEndpoint<
        infer I,
        infer O
    >
        ? HandlerEndpoint<I, O>
        : Route extends RouteNested<infer R>
        ? HandlerNested<R>
        : never;

    type HandlerEndpoint<I extends Payload, O extends Zod.ZodTypeAny> = (
        input: PayloadType<I>,
    ) => Promise<Zod.TypeOf<O>>;

    type HandlerNested<Routes extends RoutesAny> = {
        [Segment in keyof Routes]: Handler<Routes[Segment]>;
    };
}

export function endpoint(method: Method) {
    return function <I extends Payload, O extends Zod.ZodTypeAny>(
        input: I,
        output: O,
    ): RouteEndpoint<I, O> {
        return {
            type: RouteType.Endpoint,
            endpoint: { method, input, output },
        };
    };
}

export const get = endpoint(Method.Get);
export const post = endpoint(Method.Post);

export function routes<Routes extends RoutesAny>(
    routes: Routes,
): RouteNested<Routes> {
    return { type: RouteType.Nested, routes };
}
