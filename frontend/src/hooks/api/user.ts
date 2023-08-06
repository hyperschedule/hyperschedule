import * as APIv4 from "hyperschedule-shared/api/v4";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@lib/config";

async function getUser() {
    const resp = await fetch(`${apiUrl}/v4/user`, { credentials: "include" });
    return resp.ok ? APIv4.User.parse(await resp.json()) : null;
}

export function useUserQuery() {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        //staleTime: Infinity,
    });
}

export function useLogin() {
    // TODO: revalidate? invalidate user? who knows how to use react query
    return useMutation({
        mutationFn: async () => {
            return await fetch(`${apiUrl}/v4/user/new-guest`, {
                method: "POST",
                credentials: "include",
            });
        },
    });
}

export function useScheduleSectionMutation() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (args: {
            scheduleId: string;
            section: APIv4.SectionIdentifier;
            add: boolean;
        }) =>
            fetch(`${apiUrl}/v4/user/section`, {
                method: args.add ? "POST" : "DELETE",
                credentials: "include",
                body: JSON.stringify(args),
            }),
        onSuccess: () => {
            client.invalidateQueries(["user"]);
        },
    });
}
