import * as Routing from ".";

export type OutputPairs<Output extends Routing.OutputSchema> = {
    [Status in keyof Output]: [Status, Zod.TypeOf<Output[Status & number]>];
}[keyof Output];

export type HandlerEndpointGet<Endpoint extends Routing.EndpointGetAny> =
    (input: {
        param: Zod.TypeOf<Endpoint["input"]["param"]>;
        query: Zod.TypeOf<Endpoint["input"]["query"]>;
    }) => Promise<OutputPairs<Endpoint["output"]>>;

export type HandlerEndpointPostJson<
    Endpoint extends Routing.EndpointPostJsonAny,
> = (input: {
    param: Zod.TypeOf<Endpoint["input"]["param"]>;
    query: Zod.TypeOf<Endpoint["input"]["query"]>;
    body: Zod.TypeOf<Endpoint["input"]["body"]>;
}) => Promise<OutputPairs<Endpoint["output"]>>;

export type HandlerEndpoint<Endpoint extends Routing.EndpointAny> =
    Endpoint extends Routing.EndpointGetAny
        ? HandlerEndpointGet<Endpoint>
        : Endpoint extends Routing.EndpointPostJson<
              string,
              {},
              {},
              Zod.ZodTypeAny,
              { 200: Zod.ZodTypeAny }
          >
        ? HandlerEndpointPostJson<Endpoint>
        : never;

export type HandlerModuleEndpoints<Module extends Routing.ModuleEndpointsAny> =
    {
        [Key in keyof Module["endpoints"]]: HandlerEndpoint<
            Module["endpoints"][Key]
        >;
    };

export type HandlerModuleParent<Module extends Routing.ModuleParentAny> = {
    [Key in keyof Module["modules"]]: HandlerModule<Module["modules"][Key]>;
};

export type HandlerModule<Module extends Routing.ModuleAny> =
    Module extends Routing.ModuleEndpoints<Record<string, Routing.EndpointAny>>
        ? HandlerModuleEndpoints<Module>
        : Module extends Routing.ModuleParent<Record<string, Routing.ModuleAny>>
        ? HandlerModuleParent<Module>
        : never;
