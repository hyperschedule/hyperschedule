import * as Routing from "hyperschedule-shared/lib/routing";
import * as Zod from "zod";

export default Routing.modules({
    v3: Routing.endpoints({}),
    v4: Routing.endpoints({
        testPlusOne: Routing.get(
            "test/plus-one/:num",
            { param: { num: Zod.number() } },
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
