import { Middleware } from "../types/index.js";
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
declare const poweredBy: <T extends Record<string, any> = {}, Path extends string = any>(serverName?: string) => Middleware<T, Path>;
export { poweredBy, poweredBy as default };
