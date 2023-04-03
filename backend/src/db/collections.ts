import type * as APIv4 from "hyperschedule-shared/api/v4";
import { connector } from "./connector";
import type { Collection, ClientSession } from "mongodb";

export type DBSection = Omit<APIv4.Section, "identifier"> & {
    _id: APIv4.SectionIdentifier;
};

export namespace collections {
    export function users(): Collection<APIv4.User> {
        if (!connector.connected) throw Error("Database not connected");
        return connector.db.collection<APIv4.User>("users");
    }

    export function sections(): Collection<DBSection> {
        if (!connector.connected) throw Error("Database not connected");
        return connector.db.collection<DBSection>("sections");
    }

    export function startSession(): ClientSession {
        if (!connector.connected) throw Error("Database not connected");
        return connector.client.startSession();
    }
}
