export * as Typings from "./typings";
import { routes, get, post } from "./typings";
import * as Zod from "zod";

export default routes({
    v3: routes({
        courses: get({}, Zod.void()),
    }),
    v4: routes({
        sections: get({}, Zod.number()),
    }),
});
