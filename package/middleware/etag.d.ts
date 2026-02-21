import { Middleware } from "../types/index.js";
/**
 * ETag Middleware for Bun
 *
 * Automatically generates ETag headers for responses.
 * Returns 304 Not Modified if client's If-None-Match matches the ETag.
 *
 * @param options.strongEtag - true for strong ETag (default), false for weak
 */
export declare function Etag<T extends Record<string, any> = {}, Path extends string = any>(options?: {
    strongEtag?: boolean;
}): Middleware<T, Path>;
export default Etag;
