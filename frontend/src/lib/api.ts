import { z } from "zod";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { toast } from "react-toastify";

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
            body: payload === null ? "" : JSON.stringify(payload),
            credentials: "include",
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
