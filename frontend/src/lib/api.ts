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
            status: 200,
        },
        delete: {
            body: APIv4.DeleteScheduleRequest,
            return: z.void(),
            status: 204,
        },
        patch: {
            body: APIv4.RenameScheduleRequest,
            return: z.void(),
            status: 204,
        },
        put: {
            body: APIv4.DuplicateScheduleRequest,
            return: APIv4.DuplicateScheduleResponse,
            status: 200,
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
    showToastOnError: boolean,
) {
    return async function (response: Response) {
        if (response.status !== schema.status) {
            if (showToastOnError)
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
            if (showToastOnError)
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
        toast.error(
            "Unexpected network error while connecting to the server. Your change is not saved. Please refresh the page.",
            { autoClose: false },
        );
        throw e;
    }
}

export function schemaFetch<
    Schema extends Schema.RouteSchemaAny,
    Method extends Schema.RouteMethods<Schema>,
>(
    schema: Schema,
    method: Method,
    showToastOnError: boolean = true,
): Schema.RouteFetch<Schema, Method> {
    const methodSchema = schema.methods[method]!;

    const url = `${__API_URL__}${schema.path}`;
    const defaultFetchOptions = {
        method: method.toUpperCase(),
        credentials: "include",
    } as const;
    const validate = validateResponse(methodSchema, showToastOnError);
    const fetchFunc = showToastOnError ? fetchWithToast : fetch;

    return (
        "body" in methodSchema
            ? (body) =>
                  fetchFunc(url, {
                      ...defaultFetchOptions,
                      body: JSON.stringify(body),
                  }).then(validate)
            : () => fetchFunc(url, defaultFetchOptions).then(validate)
    ) as Schema.RouteFetch<Schema, Method>;
}

export const apiFetch = {
    getUser: schemaFetch(schema.user, "get", false),
    addSchedule: schemaFetch(schema.schedule, "post"),
    deleteSchedule: schemaFetch(schema.schedule, "delete"),
    renameSchedule: schemaFetch(schema.schedule, "patch"),
    duplicateSchedule: schemaFetch(schema.schedule, "put"),
    addSection: schemaFetch(schema.section, "post"),
    deleteSection: schemaFetch(schema.section, "delete"),
    setSectionAttrs: schemaFetch(schema.section, "patch"),
    replaceSections: schemaFetch(schema.replaceSections, "post"),
};
