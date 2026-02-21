import { Callback, HandlerType, HTTPMethod, Middleware, RouteRegistry, ServeStatic } from "../types/index.js";
/**
 * Router configuration options.
 */
export type RouterConfig = {
    /**
     * `basePath` sets a base path prefix for the router. Useful to group routes
     * under a common prefix (for example when mounting the router on a sub-path).
     *
     * - Example: `basePath: "/api/v1"` will prefix all registered routes with `/api/v1`.
     * - Should not end with a trailing slash — the router will normalize it.
     */
    basePath?: string;
};
/**
 * Router class responsible for managing HTTP routes, middlewares,
 * and serving static files.
 *
 * @template T - Context state type, extended by route handlers.
 */
export declare class Router<T extends Record<string, any> = {}> {
    #private;
    /** Internal route registry to hold all routes */
    protected router?: RouteRegistry;
    /** Array tracking registered routes and their handlers */
    protected routes: {
        method: string;
        pattern: string;
        handlers: HandlerType;
    }[];
    /** Static file routes mapping */
    protected staticFile: Record<string, Callback<any>>;
    /** Base path prefix for all routes */
    protected basePath: string;
    /**
     * Creates a new Router instance.
     *
     * @param config - Router configuration options
     * @param config.basePath - Base path prefix for the router
     * @param config.env - Environment variables for router
     * @param config.routeRegistry - Custom route registry instance
     */
    constructor({ basePath }?: RouterConfig);
    /**
     * Registers static file routes to the application for serving files like HTML, CSS, JS, images, etc.
     *
     * This method maps routes to files defined in the `ServeStatic` object,
     * and sets appropriate HTTP headers like `Cache-Control` and custom headers.
     *
     * @example
     * ```ts
     * import { serveStatic } from "tezx/static";
     *
     * app.static(
     *   serveStatic("public", {
     *     cacheControl: "max-age=86400",
     *     headers: {
     *       "X-Powered-By": "TezX"
     *     }
     *   })
     * );
     * ```
     *
     * @param serveStatic - An object containing static file definitions and optional configuration.
     * @returns The current instance for chaining.
     */
    static(serveStatic: ServeStatic): this;
    /**
     * Registers a GET route with optional middleware(s)
     * @param path - URL path pattern (supports route parameters)
     * @param args - Handler callback or middleware(s) + handler
     * @returns Current instance for chaining
     *
     * @example
     * // Simple GET route
     * app.get('/users', (ctx) => { ... });
     * // With multiple middlewares
     * app.get('/admin', [authMiddleware, adminMiddleware], (ctx) => { ... });
     */
    get<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    get<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    get<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a POST route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    post<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    post<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    post<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a PUT route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    put<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    put<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    put<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a PATCH route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    patch<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    patch<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    patch<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a DELETE route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    delete<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    delete<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    delete<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers an OPTIONS route (primarily for CORS preflight requests)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    options<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    options<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    options<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers a HEAD route (returns headers only)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    /**
     * Register a route that responds to all HTTP methods.
     *
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     * @returns The Router instance for chaining
     */
    all<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
    all<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    all<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Registers one or more HTTP method handlers for a given path.
     *
     * Supports three overloads:
     *
     * 1. A single callback:
     *    app.when("GET", "/path", callback)
     *
     * 2. A middleware and a callback:
     *    app.when("GET", "/path", middleware, callback)
     *
     * 3. An array of middlewares and a callback:
     *    app.when("GET", "/path", [middleware1, middleware2], callback)
     *
     * @template U - Additional context to be merged into the main context
     * @template Path - The string literal type of the route path
     *
     * @param {HTTPMethod | HTTPMethod[]} methods - One or more HTTP methods like 'GET', 'POST', etc.
     * @param {Path} path - The route path (e.g., '/login')
     * @param {...(Middleware<T & U, Path> | Middleware<T & U, Path>[] | Callback<T & U, Path>)} args - Middleware(s) and final callback
     *
     * @returns {this} Returns the app instance for chaining
     */
    when<U extends Record<string, any> = {}, Path extends string = any>(methods: HTTPMethod | HTTPMethod[], path: Path, callback: Callback<T & U, Path>): this;
    when<U extends Record<string, any> = {}, Path extends string = any>(methods: HTTPMethod | HTTPMethod[], path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    when<U extends Record<string, any> = {}, Path extends string = any>(methods: HTTPMethod | HTTPMethod[], path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
    /**
     * Mount another Router instance at a given base path.
     *
     * Useful for modular route organization.
     *
     * @param path - Base path prefix to mount the sub-router
     * @param router - Router instance to mount
     * @returns The current Router instance for chaining
     *
     * @example
     * const apiRouter = new Router();
     * apiRouter.get('/users', userHandler);
     * router.addRouter('/api', apiRouter);
     */
    addRouter<U extends Record<string, any> = {}, Path extends string = any>(path: Path, router: Router<T | U | any>): void;
    /**
     * Create a route group with shared path prefix.
     *
     * Provides a scoped Router instance to define routes under a common prefix.
     *
     * @param prefix - Path prefix for the group
     * @param callback - Function receiving the scoped Router
     * @returns The current Router instance for chaining
     *
     * @example
     * router.group('/v1', (group) => {
     *   group.get('/users', v1UserHandler);
     * });
     */
    group<U extends Record<string, any> = {}, Prefix extends string = any>(prefix: Prefix, callback: (group: Router<T & U>) => void): this;
    /**
     * Register middleware(s) optionally scoped by path.
     *
     * Supports multiple overloads for flexibility:
     * - `use(middleware)`
     * - `use([middleware1, middleware2])`
     * - `use(path, middleware)`
     * - `use(path, [middleware1, middleware2])`
     * - `use(path, middleware, callbackOrRouter)`
     *
     * @param args - Path (optional), middleware(s), and optional handler or sub-router
     * @returns The current Router instance for chaining
     */
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[]): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middlewares: Middleware<T & U, Path>[]): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(middleware: Middleware<T & U, Path>): this;
    use<U extends Record<string, any> = {}, Path extends string = any>(callback: Callback<T & U, Path> | Router<(T & U) | any>): this;
}
