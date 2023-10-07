import { z } from "zod";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { toast } from "react-toastify";

import * as Schema from "hyperschedule-shared/lib/schema";

export const schema = {
    user: Schema.route("/v4/user", {
        get: { return: APIv4.ServerUser, status: 200 },
    }),
    schedule: Schema.route("/v4/user/schedule", {
        post: {
            body: APIv4.AddScheduleRequest,
            return: APIv4.AddScheduleResponse,
            status: 201,
        },
        delete: {
            body: APIv4.DeleteScheduleRequest,
            return: z.void(),
            status: 204,
        },
    }),
    section: Schema.route("/v4/user/section", {
        post: {
            body: APIv4.AddSectionRequest,
            return: z.void(),
            status: 201,
        },
        delete: {
            body: APIv4.DeleteSectionRequest,
            return: z.void(),
            status: 204,
        },
        patch: {
            body: APIv4.SetSectionAttrRequest,
            return: z.void(),
            status: 204,
        },
    }),
    replaceSections: Schema.route("/v4/user/replace-sections", {
        post: {
            body: APIv4.ReplaceSectionsRequest,
            return: z.void(),
            status: 204,
        },
    }),
};

function validateResponse<Schema extends Schema.MethodSchemaAny>(
    schema: Schema,
) {
    return async function (response: Response) {
        if (response.status !== schema.status) {
            toast.error("Unexpected response status from the server");
            console.error(response);
            throw Error();
        }
        if (response.status === 204 || response.status === 201) {
            return;
        }
        const json = await response.json();
        const result = schema.return.safeParse(json);
        if (!result.success) {
            toast.error("Invalid response data from the server");
            console.error(json);
            console.error(result);
            throw result.error;
        }

        return result.data as Schema.MethodReturn<Schema>;
    };
}

export async function fetchWithToast(...args: Parameters<typeof fetch>) {
    try {
        return await fetch(...args);
    } catch (e) {
        console.error(e);
        toast.error("Unexpected network error while connecting to the server");
        throw e;
    }
}

export function schemaFetch<
    Schema extends Schema.RouteSchemaAny,
    Method extends Schema.RouteMethods<Schema>,
>(schema: Schema, method: Method): Schema.RouteFetch<Schema, Method> {
    const methodSchema = schema.methods[method]!;

    const url = `${__API_URL__}${schema.path}`;
    const defaultFetchOptions = {
        method: method.toUpperCase(),
        credentials: "include",
    } as const;
    const validate = validateResponse(methodSchema);

    return (
        "body" in methodSchema
            ? (body) =>
                  fetchWithToast(url, {
                      ...defaultFetchOptions,
                      body: JSON.stringify(body),
                  }).then(validate)
            : () => fetchWithToast(url, defaultFetchOptions).then(validate)
    ) as Schema.RouteFetch<Schema, Method>;
}

export const apiFetch = {
    getUser: schemaFetch(schema.user, "get"),
    addSchedule: schemaFetch(schema.schedule, "post"),
    deleteSchedule: schemaFetch(schema.schedule, "delete"),
    addSection: schemaFetch(schema.section, "post"),
    deleteSection: schemaFetch(schema.section, "delete"),
    setSectionAttrs: schemaFetch(schema.section, "patch"),
    replaceSections: schemaFetch(schema.replaceSections, "post"),
};

/*
const apiSpec = {
    getUser: {
        path: "/v4/user/",
        method: "GET",
        payload: z.null(),
        response: APIv4.ServerUser,
        status: 200,
    },
    addSchedule: {
        path: "/v4/user/schedule",
        method: "POST",
        payload: APIv4.AddScheduleRequest,
        response: APIv4.AddScheduleResponse,
        status: 201,
    },
    deleteSchedule: {
        path: "/v4/user/schedule",
        method: "DELETE",
        payload: APIv4.DeleteScheduleRequest,
        response: z.void(),
        status: 204,
    },
    addSection: {
        path: "/v4/user/section",
        method: "POST",
        payload: APIv4.AddSectionRequest,
        response: z.void(),
        status: 201,
    },
    deleteSection: {
        path: "/v4/user/section",
        method: "DELETE",
        payload: APIv4.DeleteSectionRequest,
        response: z.void(),
        status: 204,
    },
    setSectionAttrs: {
        path: "/v4/user/section",
        method: "PATCH",
        payload: APIv4.SetSectionAttrRequest,
        response: z.void(),
        status: 204,
    },
    replaceSections: {
        path: "/v4/user/replace-sections",
        method: "POST",
        payload: APIv4.ReplaceSectionsRequest,
        response: z.void(),
        status: 204,
    },
};

export async function apiRequest<K extends keyof typeof apiSpec>(
    key: K,
    payload: z.TypeOf<(typeof apiSpec)[K]["payload"]>,
): Promise<z.TypeOf<(typeof apiSpec)[K]["response"]>> {
    const spec = apiSpec[key];
    let response: Awaited<ReturnType<typeof fetch>>;
    try {
        response = await fetch(`${__API_URL__}${apiSpec[key].path}`, {
            method: spec.method,
            credentials: "include",
            ...(payload === null ? {} : { body: JSON.stringify(payload) }),
        });
    } catch (e) {
        console.error(e);
        toast.error("Unexpected network error while connecting to the server");
        throw Error();
    }

    if (response.status !== spec.status) {
        toast.error("Unexpected response status from the server");
        console.error(response);
        throw Error();
    }

    const json = await response.json();
    const data = spec.response.safeParse(json);
    if (!data.success) {
        toast.error("Invalid response data from the server");
        console.error(json);
        console.error(data);
        throw Error();
    }

    return data.data;
}

 */
