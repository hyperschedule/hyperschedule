/**
 * @author Mia Celeste
 * @date Feb 2022
 *
 * This file is tracked in git as a simple mirror of endpoints-dev.
 * We promised the school not to disclose the actual production endpoint
 * specifications publicly.
 *
 * In production, this file is replaced at container runtime by mounting
 * the secret production endpoints file from /etc/hyperschedule/secrets/endpoints.ts
 * into /srv/hyperschedule/backend/src/hmc-api/fetcher/endpoints.ts.
 */

export { endpoints, endpointAuthorization } from "./endpoints-dev";
