import * as Routing from "hyperschedule-shared/lib/routing";
import * as Zod from "zod";

export default {
    v3: {},
    v4: {
        sections: Routing.get("v4/sections", {}),
        sectionsBySemester: Routing.get("v4/sections/:term/:year", {
            params: {
                term: Zod.number(),
                year: Zod.number(),
            },
        }),
    },
};
