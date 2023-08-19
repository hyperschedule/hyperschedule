import * as APIv4 from "hyperschedule-shared/api/v4";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@lib/config";
import { importFromLegacy } from "@lib/legacy-import";

async function getUser() {
    const resp = await fetch(`${apiUrl}/v4/user`, { credentials: "include" });
    return resp.ok ? APIv4.User.parse(await resp.json()) : null;
}

export function useUserQuery() {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        staleTime: Infinity,
    });
}

export function useLogin() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            return fetch(`${apiUrl}/v4/user/new-guest`, {
                method: "POST",
                credentials: "include",
            });
        },
        onSuccess: () => {
            return client.invalidateQueries(["user"]);
        },
    });
}

export function useScheduleSectionMutation() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: ({
            add,
            ...args
        }: {
            scheduleId: string;
            section: APIv4.SectionIdentifier;
            add: boolean;
        }) =>
            fetch(`${apiUrl}/v4/user/section`, {
                method: add ? "POST" : "DELETE",
                credentials: "include",
                body: JSON.stringify(args),
            }),
        onSuccess: () => {
            void client.invalidateQueries(["user"]);
        },
    });
}

export function useScheduleSectionAttrsMutation() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (args: APIv4.SetSectionAttrRequest) =>
            fetch(`${apiUrl}/v4/user/section`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify(args),
            }),
        onSuccess: () => {
            void client.invalidateQueries(["user"]);
        },
    });
}

export function useScheduleReplaceSectionsMutation() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (args: APIv4.ReplaceSectionsRequest) =>
            fetch(`${apiUrl}/v4/user/replace-sections`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(args),
            }),
        onSuccess: () => {
            return client.invalidateQueries(["user"]);
        },
    });
}

export function useLegacyImport() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: importFromLegacy,
        onSuccess: () => {
            void client.invalidateQueries(["user"]);
        },
    });
}
