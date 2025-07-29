import { generateUUID } from "../../helper/index.js";
import { Middleware } from "../../types/index.js";

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
const requestID = (
    headerName: string = "X-Request-ID",
    contextKey: string = "requestID",
): Middleware => {
    return function requestID(ctx, next) {
        // Get request ID from headers (case-insensitive check)
        const existingID =
            ctx.headers?.get(headerName.toLowerCase()) ||
            ctx.headers?.get(headerName);
        // Generate new request ID if not present
        const requestId = existingID || `req-${generateUUID()}`;
        // Store request ID in context (for logging/tracking)
        ctx[contextKey] = requestId;
        // Set request ID header in response
        ctx.setHeader(headerName, requestId);
        return next();
    };
};

export {
    requestID, requestID as default,
}