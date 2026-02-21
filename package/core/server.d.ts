import { Callback, ErrorHandler, RouteRegistry } from "../types/index.js";
import { Router, RouterConfig } from "./router.js";
export type TezXConfig = {
    /**
     * Custom route registry instance used internally to store routes.
     * If not provided, the router will use the default CombineRouteRegistry.
     */
    routeRegistry?: RouteRegistry;
} & RouterConfig;
/**
 * TezX is an ultra-fast, flexible request router and server handler.
 * It supports plug-and-play for Bun, and Node runtimes.
 *
 * @template T - The environment object shared across requests.
 *
 * @example
 * ```ts
 * const app = new TezX();
 *
 * app.get("/hello", (ctx) => ctx.text("Hello TezX"));
 * bunAdapter(app).listen();
 * ```
 */
export declare class TezX<T extends Record<string, any> = {}> extends Router<T> {
    #private;
    /** Internal route registry to hold all routes */
    protected router?: RouteRegistry;
    constructor({ basePath, routeRegistry }?: TezXConfig);
    /**
     * Register a custom 404 (not found) handler.
     *
     * @param callback - Function to handle unmatched routes.
     * @returns The current TezX instance (for chaining).
     *
     * @example
     * app.notFound((ctx) => ctx.status(404).text("Oops! Page not found."));
     */
    notFound(callback: Callback<T>): this;
    /**
     * Register a global error handler for uncaught route errors.
     *
     * @param callback - Function to handle thrown exceptions or failed routes.
     * @returns The current TezX instance (for chaining).
     *
     * @example
     * app.onError((err, ctx) => {
     *   return ctx.status(500).text("Server crashed!");
     * });
     */
    onError(callback: ErrorHandler<T>): this;
    /**
     * Handles incoming HTTP requests in a Bun environment.
     *
     * This is the core request handler for TezX in Bun. It processes
     * the request through middleware and route handlers, returning a
     * standard Fetch API `Response`.
     *
     * Special handling for `HEAD` requests:
     * - Converts `HEAD` to a `GET` request internally.
     * - Returns headers and status, but no body, per HTTP spec.
     *
     * @param {Request} req - The incoming Fetch API Request object.
     * @param {Bun.Server} server - The Bun server instance.
     * @returns {Promise<Response>} A Fetch API Response object, ready to be sent by Bun.
     *
     * @example
     * Bun.serve({
     *   port: 3000,
     *   fetch: (req) => app.serve(req, server),
     * });
     */
    serve(req: Request, server: Bun.Server<any>): Promise<Response>;
}
