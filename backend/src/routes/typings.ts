import type * as Fastify from "fastify";
import type * as Zod from "zod";
import routes from "hyperschedule-shared/routes";
import {
    Method,
    type RoutesAny,
    type RouteAny,
    RouteType,
    type Payload,
    type PayloadType,
    type RouteEndpoint,
    type RouteNested,
} from "hyperschedule-shared/routes/typings";

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

function setupRoute(server: Fastify.FastifyInstance) {
    return function go<R extends RouteAny>(
        prefix: string[],
        route: R,
        handler: Handler<R>,
    ) {
        if (route.type === RouteType.Endpoint) {
            const path = `/${prefix.join("/")}`;
            const handlerCast = handler as HandlerEndpoint<
                Payload,
                Zod.ZodTypeAny
            >;
            switch (route.endpoint.method) {
                case Method.Get:
                    server.get(path, {}, async (request, reply) => {
                        reply.header("Access-Control-Allow-Origin", "*");
                        request.query;
                    });
                    return;
                case Method.Post:
                    server.post(path, {}, async (request, reply) => {
                        reply.header("Access-Control-Allow-Origin", "*");
                        request.body;
                    });
                    return;
            }
            return;
        }

        for (const [segment, nestedRoute] of Object.entries(route.routes))
            go(
                [...prefix, segment],
                nestedRoute,
                // I _think_ this is safe?
                (handler as HandlerNested<RoutesAny>)[segment]!,
            );
    };
}

function setup(server: Fastify.FastifyInstance) {
    setupRoute(server)([], routes, {
        v3: { courses: async () => {} },
        v4: {
            sections: async () => {
                return 3;
            },
        },
    });
}
