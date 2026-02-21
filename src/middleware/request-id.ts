import { generateUUID } from "../helper/index.js";
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
const requestID = <T extends Record<string, any> = {}, Path extends string = any>(
  headerName: string = "X-Request-ID",
  contextKey: string = "requestID",
): Middleware<T, Path> => {
  return function requestID(ctx, next) {
    let requestId = ctx.headers.get(headerName) ?? `req-${generateUUID()}`;
    (ctx as any)[contextKey] = requestId;
    ctx.headers.set(headerName, requestId);
    return next();
  };
};

export { requestID as default, requestID };
