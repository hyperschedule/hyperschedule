import * as APIv4 from "hyperschedule-shared/api/v4";
import { toast, type Id } from "react-toastify";
import type { z } from "zod";
import { queryClient } from "@hooks/api/query";

type ErrorMessageStatus = {
    lastId: Id | null;
    sourceCount: number;
};

const networkStatus: ErrorMessageStatus = {
    lastId: null,
    sourceCount: 0,
};

function errorMessageWithRetry(description?: string) {
    if (networkStatus.lastId) {
        toast.dismiss(networkStatus.lastId);
    }

    const message = (
        <div>
            <strong>Network error:</strong> cannot load{" "}
            {description ?? `${networkStatus.sourceCount} different endpoints`}.
            Please check your internet connection.{" "}
            <button
                onClick={() => {
                    void queryClient.refetchQueries();
                    toast.dismiss(networkStatus.lastId!);
                    networkStatus.lastId = null;
                    networkStatus.sourceCount = 0;
                }}
            >
                Retry
            </button>
        </div>
    );

    networkStatus.lastId = toast.error(message, {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
    });
}

// we are not using the schemaFetch because this is a way less complicated
// situation, and there's no cross-origin credentials involved
async function getData<T extends z.ZodType>(
    url: string,
    type: T,
    endpointDescription: string,
): Promise<z.infer<T>> {
    let resp: Response;

    try {
        resp = await fetch(url);
    } catch {
        if (networkStatus.lastId === null) {
            errorMessageWithRetry(endpointDescription);
            networkStatus.sourceCount = 1;
        } else {
            networkStatus.sourceCount++;
            errorMessageWithRetry();
        }
        // throwing error so it can trigger refetch in the future
        throw Error("Failed to fetch");
    }

    if (!resp.ok) {
        toast.error(
            `Unexpected error from the server: ${resp.statusText}. 
            If this error persists, our server is probably down.`,
        );

        console.error(
            "Failed to fetch %s %s %O",
            url,
            resp.statusText,
            resp.headers,
        );

        throw Error(resp.statusText);
    }
    const json = await resp.json();
    const result = type.safeParse(json);
    if (!result.success) {
        toast.error(
            "Unexpected data from the server. If this error persists, our server is probably down",
        );
        console.error(result.error);
        throw Error("zod error");
    }
    return result.data;
}

export async function getAllTerms() {
    return getData(
        `${__API_URL__}/v4/term/all`,
        APIv4.TermIdentifier.array(),
        "list of available semesters",
    );
}

export async function getSectionsForTerm(term: APIv4.TermIdentifier) {
    const termString = APIv4.stringifyTermIdentifier(term);
    const sections = await getData(
        `${__API_URL__}/v4/sections/${termString}`,
        APIv4.Section.array(),
        `course data for ${termString}`,
    );

    // we want the areas for schools to appear last, which is sorted numerically
    sections.forEach((s) => s.courseAreas.reverse());
    return sections;
}

export async function getCourseAreaDescription() {
    const data = await getData(
        `${__API_URL__}/v4/course-areas`,
        APIv4.CourseAreaDescription.array(),
        "course areas",
    );

    return new Map<string, string>(
        // we can't use Object.values here because we don't know the source
        // definition order
        data.map((a) => [a.area, a.description]),
    );
}

export async function getOfferingHistory(term: APIv4.TermIdentifier) {
    const termString = APIv4.stringifyTermIdentifier(term);

    return getData(
        `${__API_URL__}/v4/offering-history/${termString}`,
        APIv4.OfferingHistory.array(),
        `course offering histories for ${termString}`,
    );
}
