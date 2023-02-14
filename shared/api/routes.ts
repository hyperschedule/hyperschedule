import * as Routing from "hyperschedule-shared/lib/routing";
import * as Server from "hyperschedule-shared/lib/routing/server";
import * as Zod from "zod";

const root = Routing.modules({
    v3: Routing.endpoints({}),
    v4: Routing.endpoints({
        testPlusOne: Routing.get(
            "test/plus-one/:num",
            { param: { num: Zod.number() } },
            { 200: Zod.number() },
        ),
        testMinusOne: Routing.postJson(
            "test/minus-one",
            { body: Zod.object({ num: Zod.number() }) },
            { 200: Zod.number() },
        ),
        //sections: Routing.get("v4/sections", {}, { 200: Zod.void() }),
        //sectionsBySemester: Routing.get(
        //    "v4/sections/:term/:year",
        //    {
        //        param: {
        //            term: Zod.number(),
        //            year: Zod.number(),
        //        },
        //    },
        //    { 200: Zod.void() },
        //),
    }),
});

export default root;

type T = Server.HandlerModule<typeof root>;
type X = T["v4"];
