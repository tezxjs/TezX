"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poweredBy = void 0;
/**
 * PoweredBy Middleware
 * Adds an "X-Powered-By" header to responses.
 *
 * @param {string} [serverName] - Optional custom server name; defaults to "TezX".
 * @returns {Middleware} - A middleware function for setting the "X-Powered-By" header.
 *
 * @example
 * ```ts
 * import { poweredBy } from 'tezx';
 *
 * app.use(poweredBy("MyServer"));
 * ```
 */
const poweredBy = (serverName) => {
    return (ctx, next) => {
        ctx.header('X-Powered-By', serverName || "TezX"); // Set the header with a default value
        return next(); // Proceed to next middleware
    };
};
exports.poweredBy = poweredBy;
