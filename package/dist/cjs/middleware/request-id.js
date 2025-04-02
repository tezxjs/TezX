"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestID = void 0;
const helper_1 = require("../helper");
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
const requestID = (headerName = "X-Request-ID") => {
    return (ctx, next) => {
        // Get request ID from headers (case-insensitive check)
        const existingID = ctx.headers?.get(headerName.toLowerCase()) || ctx.headers?.get(headerName);
        // Generate new request ID if not present
        const requestId = existingID || `req-${(0, helper_1.generateID)()}`;
        // Store request ID in context (for logging/tracking)
        ctx.state.set('requestID', requestId);
        // Set request ID header in response
        ctx.header(headerName, requestId);
        return next();
    };
};
exports.requestID = requestID;
