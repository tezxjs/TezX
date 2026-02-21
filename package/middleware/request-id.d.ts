import { Middleware } from "../types/index.js";
/**
 * Request ID Middleware
 * Assigns a unique request ID to each incoming request.
 *
 * @param {string} [headerName="X-Request-ID"] - Header name to use for request ID.
 * @returns {Middleware} - A middleware function for tracking requests.
 *
 * @example
 * ```ts
 * import { requestID } from 'tezx';
 *
 * app.use(requestID());
 * ```
 */
declare const requestID: <T extends Record<string, any> = {}, Path extends string = any>(headerName?: string, contextKey?: string) => Middleware<T, Path>;
export { requestID as default, requestID };
