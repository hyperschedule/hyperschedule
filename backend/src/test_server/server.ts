import { App, Request, Response } from "@tinyhttp/app";
import { endpoints, endpointAuthorization } from "../hmc-api/fetcher/endpoints";
import { Endpoint } from "../hmc-api/fetcher/types";
import * as fetcherUtils from "../hmc-api/fetcher/utils";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "../current-term";

const enum HttpStatus {
    Ok = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
}

const enum QueryParam {
    Year = "YEAR",
    Session = "SESSION",
    Catalog = "CATALOG",
}

const endpointFilePaths: Record<string, Endpoint> = Object.fromEntries(
    Object.values(endpoints).map((endpoint) => [endpoint.link, endpoint]),
);

function send_bad_request_response(res: Response, text: string) {
    res.status(HttpStatus.BadRequest)
        .header("Content-Type", "text/plain")
        .send(text);
}

function loadSessionQuery(
    req: Request,
    res: Response,
): APIv4.TermIdentifier | null {
    const qYear = req.query[QueryParam.Year];
    const qSession = req.query[QueryParam.Session];
    try {
        if (typeof qYear !== "string" || typeof qSession !== "string") {
            throw new Error();
        }
        const year = parseInt(qYear);
        const session = APIv4.TermEnum.parse(qSession);
        return APIv4.TermIdentifier.parse({ year, term: session });
    } catch {
        send_bad_request_response(
            res,
            `Invalid query parameters; got year='${qYear}', session='${qSession}'`,
        );
        return null;
    }
}

function loadCatalogQuery(
    req: Request,
    res: Response,
): APIv4.TermIdentifier | null {
    const qCatalog = req.query[QueryParam.Catalog];
    try {
        if (typeof qCatalog !== "string") throw new Error();

        const match = /^UG(?<yearDigits>\d{2})$/.exec(qCatalog);
        if (match === null) throw new Error();

        // Safety: If the regex matches, then the capture group must exist.
        const year = 2000 + parseInt(match.groups!["yearDigits"]!);
        const session = APIv4.Term.fall; // Best guess with given info
        return APIv4.TermIdentifier.parse({ year, term: session });
    } catch {
        send_bad_request_response(
            res,
            `Invalid query parameter; got catalog='${qCatalog}'`,
        );
        return null;
    }
}

function loadQuery(req: Request, res: Response): APIv4.TermIdentifier | null {
    const isSession =
        QueryParam.Year in req.query || QueryParam.Session in req.query;
    const isCatalog = QueryParam.Catalog in req.query;
    if (isSession && !isCatalog) {
        return loadSessionQuery(req, res);
    } else if (isCatalog && !isSession) {
        return loadCatalogQuery(req, res);
    } else if (!isCatalog && !isSession) {
        return CURRENT_TERM;
    } else {
        send_bad_request_response(
            res,
            `'year' and 'status' query parameters are mutually exclusive with ` +
                ` 'catalog' query parameter`,
        );
        return null;
    }
}

export const server = new App().get("/:endpoint", async (req, res) => {
    if (req.headers.authorization !== endpointAuthorization) {
        res.sendStatus(HttpStatus.Unauthorized);
        return;
    }

    // Safety: This function will only be called if req.params["endpoint"]
    // exists. So it is safe to assume "endpoint" is a valid key.
    const endpointString: string = req.params["endpoint"]!;
    const endpoint = endpointFilePaths[endpointString];
    if (endpoint === undefined) {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    const query = loadQuery(req, res);
    if (query === null) return;

    let data;
    try {
        data = await fetcherUtils.loadStatic(endpoint, query);
    } catch {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    if (endpoint.saveAs.endsWith(".json")) {
        res.header("Content-Type", "application/json");
    } else {
        res.header("Content-Type", "text/plain");
    }
    res.status(HttpStatus.Ok).send(data);
});
