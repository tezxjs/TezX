import { Middleware } from "../../types/index.js";

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
const poweredBy = (serverName?: string): Middleware => {
    return function poweredBy(ctx, next) {
        ctx.setHeader("x-powered-by", serverName || "TezX"); // Set the header with a default value
        return next(); // Proceed to next middleware
    };
};

export {
    poweredBy, poweredBy as default,
}