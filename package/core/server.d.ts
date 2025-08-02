import { Callback, ErrorHandler } from "../types/index.js";
import { Router, RouterConfig } from "./router.js";
export type TezXConfig = {
    /**
     * 🔄 Hook to transform or normalize the incoming request pathname before routing.
     *
     * This function allows you to customize how incoming paths are handled.
     * You can use it to:
     * - Remove trailing slashes
     * - Normalize casing
     * - Rewrite certain paths dynamically
     * - Add localization or versioning prefixes
     *
     * @example
     * ```ts
     * onPathResolve: (pathname) => pathname.replace(/\/+$/, "").toLowerCase()
     * ```
     *
     * @param pathname - The raw incoming request path (e.g., `/Api/Users/`)
     * @returns The transformed or resolved path used for routing (e.g., `/api/users`)
     */
    onPathResolve?: (pathname: string) => string;
    /**
     * Enables or disables debugging for the middleware.
     * When set to `true`, detailed debug logs will be output,
     * useful for tracking the flow of requests and identifying issues.
     *
     * @default false
     */
    debugMode?: boolean;
} & RouterConfig;
/**
 * TezX is an ultra-fast, flexible request router and server handler.
 * It supports plug-and-play for Deno, Bun, and Node runtimes.
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
    constructor({ basePath, env, debugMode, onPathResolve, routeRegistry, }?: TezXConfig);
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
     * Main request handler compatible with multiple runtimes (Node.js, Deno, Bun).
     *
     * This function can be passed directly to native HTTP servers to handle incoming requests.
     *
     * ### Usage examples:
     *
     * #### Bun
     * ```ts
     * // Simple usage with Bun's built-in HTTP server
     * app.serve(request, server);
     *
     * // Or with WebSocket support (required for ws handling)
     * Bun.serve({
     *   port: 3001,
     *   reusePort: true, // enables SO_REUSEPORT for clustering
     *   fetch: app.serve,
     *   websocket: {
     *     open(ws) {
     *       console.log(ws.data);
     *       return ws.data?.open?.(ws);
     *     },
     *     message(ws, msg) {
     *       return ws.data?.message?.(ws, msg);
     *     },
     *     close(ws, code, reason) {
     *       return ws.data?.close?.(ws, { code, reason });
     *     },
     *     ping(ws, data) {
     *       return ws.data?.ping?.(ws, data);
     *     },
     *     pong(ws, data) {
     *       return ws.data?.pong?.(ws, data);
     *     },
     *     drain(ws) {
     *       return ws.data?.drain?.(ws);
     *     },
     *   },
     * });
     * ```
     *
     * #### Deno
     * ```ts
     * // Using Deno’s serve method with connection info
     * serve((req, connInfo) => app.serve(req, connInfo));
     *
     * // Or using Deno’s built-in Deno.serve with options
     * Deno.serve({ port: 8080 }, app.serve);
     * ```
     *
     * #### Node.js
     * ```ts
     * import { createServer } from "http";
     * import { mountTezXOnNode } from "tezx/node";
     *
     * // Option 1: Manually convert and forward request/response
     * const response = await app.serve(toWebRequest(req, req.method), req, res, server);
     *
     * // Option 2: Use provided utility to mount TezX app onto native HTTP server
     * const server = createServer();
     * mountTezXOnNode(app, server);
     * server.listen(3000);
     * ```
     *
     * @param {Request} req - Native Fetch API Request object.
     * @param {...any} args - Runtime-specific arguments such as connection info (Deno), server instances, or response objects.
     * @returns {Promise<Response>} The final response to be sent back to the client or the result of WebSocket handlers.
     *
     * @example
     * ```ts
     * const response = await app.serve(new Request("http://localhost/hello"));
     * ```
     */
    serve(req: Request, ...args: any[]): Promise<Response>;
}
