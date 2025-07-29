import { Callback, HandlerType, HTTPMethod, Middleware, RouteRegistry, StaticServeOption } from "../types/index.js";
export type RouterConfig = {
    /**
     * Custom route registry instance used internally to store routes.
     * Defaults to CombineRouteRegistry.
     */
    routeRegistry?: RouteRegistry;
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
/**
 * Router class responsible for managing HTTP routes, middlewares,
 * and serving static files.
 *
 * @template T - Context state type, extended by route handlers.
 */
export declare class Router<T extends Record<string, any> = {}> {
    #private;
    /** Environment variables accessible within this router */
    protected env: Record<string, string | number>;
    /** Internal route registry to hold all routes */
    protected router: RouteRegistry;
    /** Array tracking registered routes and their handlers */
    protected route: {
        method: string;
        pattern: string;
        handlers: HandlerType;
    }[];
    /** Static file routes mapping */
    protected staticFileRouter: Record<string, Callback<any>>;
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
    constructor({ basePath, env, routeRegistry }?: RouterConfig);
    /**
    * Serve static files from a directory with optional route prefix.
    *
    * Overloads:
    * - `static(route: string, folder: string, option?: StaticServeOption): this`
    * - `static(folder: string, option?: StaticServeOption): this`
    *
    * @param args - Variable arguments depending on overload
    * @returns The Router instance for chaining
    *
    * @throws Error if invalid arguments are passed
    *
    * @example
    * // Serve static files at "/assets" route from "./public" folder
    * router.static("/assets", "./public");
    *
    * // Serve static files from "./public" at root "/"
    * router.static("./public");
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
     * Generic method registration for custom HTTP methods
     * @param method - HTTP method name (e.g., 'PURGE')
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     *
     * @example
     * // Register custom method
     * server.addRoute('PURGE', '/cache', purgeHandler);
     */
    addRoute<U extends Record<string, any> = {}, Path extends string = any>(method: HTTPMethod, path: Path, callback: Callback<T & U, Path>): this;
    addRoute<U extends Record<string, any> = {}, Path extends string = any>(method: HTTPMethod, path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>): this;
    addRoute<U extends Record<string, any> = {}, Path extends string = any>(method: HTTPMethod, path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>): this;
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
