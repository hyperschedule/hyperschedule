import * as APIv4 from "hyperschedule-shared/api/v4";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@lib/config";
import { importFromLegacy } from "@lib/legacy-import";
import { toast } from "react-toastify";
import useStore from "../store";

async function getUser(): Promise<APIv4.User> {
    // we let any error here throw so they can propagate to trigger re-fetches
    const resp = await fetch(`${apiUrl}/v4/user`, { credentials: "include" });
    return APIv4.User.parse(await resp.json());
}

export function useUserQuery() {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        staleTime: Infinity,
    });
}

export function useUser(): APIv4.User | null {
    const query = useUserQuery();
    return query.data ?? null;
}

async function updateActiveScheduleToApi(
    user: APIv4.User | null,
    request: APIv4.SetActiveScheduleRequest,
) {
    if (user === null) return;

    return fetch(`${apiUrl}/v4/user/active-schedule`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(request),
    });
}

export function useActiveScheduleMutation() {
    const user = useUser();
    const setActiveScheduleId = useStore((store) => store.setActiveScheduleId);
    const activeScheduleId = useStore((store) => store.activeScheduleId);
    return useMutation({
        mutationFn: async (args: APIv4.SetActiveScheduleRequest) => {
            if (args.scheduleId === activeScheduleId) return;
            setActiveScheduleId(args.scheduleId);
            return updateActiveScheduleToApi(user, args);
        },
    });
}

export function useGuestLogin() {
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
        onError: () => {
            toast.error("No data found from legacy hyperschedule", {});
        },
    });
}
