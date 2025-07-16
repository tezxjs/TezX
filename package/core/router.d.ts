import { Callback, DuplicateMiddlewares, HTTPMethod, Middleware, PathType, StaticServeOption, UniqueMiddlewares } from "../types/index.js";
import { Context } from "./context.js";
import MiddlewareConfigure from "./MiddlewareConfigure.js";
export type RouterConfig = {
    /**
     * `env` allows you to define environment variables for the router.
     * It is a record of key-value pairs where the key is the variable name
     * and the value can be either a string or a number.
     */
    env?: Record<string, string | number>;
    /**
     * `basePath` sets the base path for the router. This is useful for grouping
     * routes under a specific path prefix.
     */
    basePath?: string;
};
export declare class TrieRouter {
    children: Map<string, TrieRouter>;
    handlers: Map<HTTPMethod, {
        callback: Callback<any>;
        middlewares: UniqueMiddlewares | DuplicateMiddlewares;
    }>;
    pathname: string;
    paramName: any;
    isParam: boolean;
    constructor(pathname?: string);
}
export type RouterHandler<T extends Record<string, any>> = {
    callback: Callback<T>;
    paramNames: string[];
    regex: RegExp;
    middlewares: UniqueMiddlewares | DuplicateMiddlewares;
};
export declare class Router<T extends Record<string, any> = {}> extends MiddlewareConfigure<T> {
    #private;
    protected routers: Map<string, Map<HTTPMethod, RouterHandler<T>>>;
    protected env: Record<string, string | number>;
    protected triRouter: TrieRouter;
    constructor({ basePath, env }?: RouterConfig);
    /**
     * Serves static files from a specified directory.
     *
     * This method provides two overloads:
     * 1. `static(route: string, folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the specified `route`.
     * 2. `static(folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the root (`/`).
     *
     * @param {string} route - The base route to serve static files from (optional in overload).
     * @param {string} folder - The folder containing the static files.
     * @param {StaticServeOption} [option] - Optional settings for static file serving.
     * @returns {this} Returns the current instance to allow method chaining.
     */
    static(route: string, folder: string, option?: StaticServeOption): this;
    static(folder: string, Option?: StaticServeOption): this;
    /**
     * Registers a GET route with optional middleware(s)
     * @param path - URL path pattern (supports route parameters)
     * @param args - Handler callback or middleware(s) + handler
     * @returns Current instance for chaining
     *
     * @example
     * // Simple GET route
     * app.get('/users', (ctx) => { ... });
     *
     * // With middleware
     * app.get('/secure', authMiddleware, (ctx) => { ... });
     * app.get(/^\/item\/(\d+)\/(edit|view)?\/?$/, (ctx) => { ... });
     *
     * // With multiple middlewares
     * app.get('/admin', [authMiddleware, adminMiddleware], (ctx) => { ... });
     */
    get<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    get<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    get<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a Server-Sent Events (SSE) route handler for the given path.
     *
     * This method sets up an HTTP GET route that sends real-time updates to the client
     * over a persistent HTTP connection using the SSE protocol.
     *
     * ### Example:
     * ```ts
     * app.sse("/events", async (ctx) => {
     *   const stream = new ReadableStream({
     *     start(controller) {
     *       controller.enqueue(new TextEncoder().encode("data: Hello\n\n"));
     *       ctx.rawRequest?.signal?.addEventListener("abort", () => {
     *          clearInterval(interval);
     *          controller.close()
     *        });
     *     },
     *   });
     *
     *   return ctx.send(stream, {
     *     headers: {
     *       "Content-Type": "text/event-stream",
     *       "Cache-Control": "no-cache",
     *       "Connection": "keep-alive",
     *     },
     *   });
     * });
     * ```
     *
     * @param {PathType} path - The route path for SSE (e.g. `/events`).
     * @param {(ctx: Context) => any} handler - A handler function that returns a streamed response.
     */
    sse<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, handler: (ctx: Context<T & U, Path>) => any): void;
    /**
     * Registers a POST route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    post<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    post<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    post<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a PUT route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    put<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    put<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    put<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a PATCH route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    patch<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    patch<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    patch<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a DELETE route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    delete<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    delete<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    delete<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers an OPTIONS route (primarily for CORS preflight requests)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    options<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    options<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    options<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a HEAD route (returns headers only)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    head<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    head<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    head<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a route that responds to all HTTP methods
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    all<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, callback: Callback<T & U, Path>): this;
    all<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    all<U extends Record<string, any> = {}, Path extends PathType = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Generic method registration for custom HTTP methods
     * @param method - HTTP method name (e.g., 'PURGE')
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     *
     * @example
     * // Register custom method
     * server.addRoute('PURGE', '/cache', purgeHandler);
     */
    addRoute<U extends Record<string, any> = {}, Path extends PathType = any>(method: HTTPMethod, path: Path, callback: Callback<T & U, Path>): this;
    addRoute<U extends Record<string, any> = {}, Path extends PathType = any>(method: HTTPMethod, path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    addRoute<U extends Record<string, any> = {}, Path extends PathType = any>(method: HTTPMethod, path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Mount a sub-router at specific path prefix
     * @param path - Base path for the sub-router
     * @param router - Router instance to mount
     * @returns Current instance for chaining
     *
     * @example
     * const apiRouter = new Router();
     * apiRouter.get('/users', () => { ... });
     * server.addRouter('/api', apiRouter);
     */
    addRouter<U extends Record<string, any> = {}, Path extends string = any>(path: Path, router: Router<T | U | any>): void;
    /**
     * Create route group with shared path prefix
     * @param prefix - Path prefix for the group
     * @param callback - Function that receives group-specific router
     * @returns Current router instance for chaining
     *
     * @example
     * app.group('/v1', (group) => {
     *   group.get('/users', v1UserHandler);
     * });
     */
    group<U extends Record<string, any> = {}, Prefix extends string = any>(prefix: Prefix, callback: (group: Router<T & U>) => void): this;
    /**
     * Register middleware with flexible signature
     * @overload
     * @param path - Optional path to scope middleware
     * @param middlewares - Middleware(s) to register
     * @param [callback] - Optional sub-router or handler
     */
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path> | Router<T & U | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path> | Router<T & U | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[]): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path> | Router<T & U | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path> | Router<T & U | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path> | Router<T & U | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middlewares: Middleware<T & U, Path>[]): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middleware: Middleware<T & U, Path>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(callback: Callback<T & U, Path> | Router<T & U | any>): this;
}
