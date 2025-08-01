import { Middleware } from "../types/index.js";
/**
 * Middleware to extract and inject connection information into the request context.
 *
 * This middleware reads the socket's remote address information (like IP, port, and family)
 * from the request object and attaches it to `ctx.req.remoteAddress`.
 *
 * @returns {Middleware<any>} The middleware function that sets `ctx.req.remoteAddress`.
 *
 * @example
 * import { getConnInfo } from "tezx/node";
 *
 * app.use(getConnInfo());
 *
 * // Access later in route handler:
 * router.get("/", (ctx) => {
 *   const ip = ctx.req.remoteAddress?.address;
 *   return new Response(`Your IP: ${ip}`);
 * });
 */
export declare function getConnInfo(): Middleware<any>;
