//src/core/router.ts
import { Context } from "../index.js";
import {
  Callback,
  HandlerType,
  HTTPMethod,
  Middleware,
  RouteRegistry,
  ServeStatic,
} from "../types/index.js";
import { sanitizePathSplitBasePath } from "../utils/url.js";

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
export class Router<T extends Record<string, any> = {}> {

  /** Internal route registry to hold all routes */
  protected router?: RouteRegistry;

  /** Array tracking registered routes and their handlers */
  protected routes: {
    method: string;
    pattern: string;
    handlers: HandlerType;
  }[] = [];

  /** Static file routes mapping */
  protected staticFile: Record<string, Callback<any>> = Object.create(null);

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
  constructor({ basePath = "/" }: RouterConfig = {}) {
    this.basePath = basePath;
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.all = this.all.bind(this);
    this.addRouter = this.addRouter.bind(this);
    this.group = this.group.bind(this);
  }

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
  static(serveStatic: ServeStatic): this {
    if (Array.isArray(serveStatic?.files)) {
      const strong = serveStatic?.options?.strongEtag ?? true;
      const disabled = serveStatic?.options?.disableEtag;
      if (disabled) {
        serveStatic?.files.forEach((s) => {
          this.staticFile[`GET ${s?.route}`] = async (ctx: Context) => {
            if (serveStatic?.options?.cacheControl) {
              ctx.setHeader("Cache-Control", serveStatic?.options.cacheControl);
            }
            return ctx.sendFile(s.fileSource, {
              headers: serveStatic?.options?.headers,
            });
          };
        });
      }
      else {
        serveStatic?.files.forEach((s) => {
          this.staticFile[`GET ${s?.route}`] = async (ctx: Context) => {
            if (serveStatic?.options?.cacheControl) {
              ctx.setHeader("Cache-Control", serveStatic?.options.cacheControl);
            }
            const stat = await Bun.file(s?.fileSource).stat();
            const raw = `${stat.size}-${Math.floor(stat.mtimeMs ?? Date.now())}`;
            let etagVal = strong ? `"${raw}"` : `W/"${raw}"`;
            ctx.headers.set("Etag", etagVal);
            const ifNoneMatch = ctx.req.header("if-none-match");
            if (ifNoneMatch === etagVal) {
              return new Response(null, {
                status: 304,
                headers: { "ETag": etagVal },
              });
            }

            return ctx.sendFile(s.fileSource, {
              headers: serveStatic?.options?.headers,
            });
          };
        });
      }
    }
    return this;
  }

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
  public get<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public get<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public get<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public get(path: string, ...args: any[]): this {
    this.#registerRoute("GET", path, ...args);
    return this;
  }

  /**
   * Registers a POST route with optional middleware(s)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  public post<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public post<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public post<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public post(path: string, ...args: any[]): this {
    this.#registerRoute("POST", path, ...args);
    return this;
  }

  /**
   * Registers a PUT route with optional middleware(s)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  public put<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public put<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public put<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public put(path: string, ...args: any[]): this {
    this.#registerRoute("PUT", path, ...args);
    return this;
  }

  /**
   * Registers a PATCH route with optional middleware(s)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  public patch<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public patch<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public patch<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public patch(path: string, ...args: any[]): this {
    this.#registerRoute("PATCH", path, ...args);
    return this;
  }

  /**
   * Registers a DELETE route with optional middleware(s)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  public delete<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public delete<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public delete<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public delete(path: string, ...args: any[]): this {
    this.#registerRoute("DELETE", path, ...args);
    return this;
  }

  /**
   * Registers an OPTIONS route (primarily for CORS preflight requests)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  public options<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public options<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public options<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public options(path: string, ...args: any[]): this {
    this.#registerRoute("OPTIONS", path, ...args);
    return this;
  }

  /**
   * Registers a HEAD route (returns headers only)
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   */
  // public head<U extends Record<string, any> = {}, Path extends string = any>(path: Path, callback: Callback<T & U, Path>): this;
  // public head<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middleware: Middleware<T & U, Path>, callback: Callback<T & U, Path>,): this;
  // public head<U extends Record<string, any> = {}, Path extends string = any>(path: Path, middlewares: Middleware<T & U, Path>[], callback: Callback<T & U, Path>,): this;
  // public head(path: string, ...args: any[]): this {
  //   this.#registerRoute("HEAD", path, ...args);
  //   return this;
  // }

  /**
   * Register a route that responds to all HTTP methods.
   *
   * @param path - URL path pattern
   * @param args - Handler callback or middleware(s) + handler
   * @returns The Router instance for chaining
   */
  public all<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  public all<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  public all<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  public all(path: string, ...args: any[]): this {
    this.#registerRoute("ALL", path, ...args);
    return this;
  }

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
  when<U extends Record<string, any> = {}, Path extends string = any>(
    methods: HTTPMethod | HTTPMethod[],
    path: Path,
    callback: Callback<T & U, Path>,
  ): this;
  when<U extends Record<string, any> = {}, Path extends string = any>(
    methods: HTTPMethod | HTTPMethod[],
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path>,
  ): this;
  when<U extends Record<string, any> = {}, Path extends string = any>(
    methods: HTTPMethod | HTTPMethod[],
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path>,
  ): this;
  when(methods: HTTPMethod | HTTPMethod[], path: string, ...args: any[]): this {
    const methodList = Array.isArray(methods) ? methods : [methods];
    for (const method of methodList) {
      this.#registerRoute(method.toUpperCase(), path, ...args);
    }
    return this;
  }
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
  public addRouter<
    U extends Record<string, any> = {},
    Path extends string = any,
  >(path: Path, router: Router<T | U | any>) {
    return this.#addRouterInstance(path, router);
  }

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
  public group<U extends Record<string, any> = {}, Prefix extends string = any>(
    prefix: Prefix,
    callback: (group: Router<T & U>) => void,
  ): this {
    const router = new Router<T & U>({
      basePath: prefix,
      // env: this.env
    });
    callback(router);
    this.#addRouterInstance<U>("/", router);
    return this;
  }

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
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>[],
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    middlewares: Middleware<T & U, Path>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    path: Path,
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    middlewares: Middleware<T & U, Path>[],
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    middleware: Middleware<T & U, Path>,
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    middlewares: Middleware<T & U, Path>[],
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    middleware: Middleware<T & U, Path>,
  ): this;
  public use<U extends Record<string, any> = {}, Path extends string = any>(
    callback: Callback<T & U, Path> | Router<(T & U) | any>,
  ): this;
  public use(...args: any[]): this {
    let path: string = "/"; // Default path
    let middlewares: Middleware<T>[] = [];
    let router: Router<T> | undefined;

    if (typeof args[0] === "string") {
      // First argument is a path
      path = args[0];
      if (Array.isArray(args[1])) {
        // Second argument is an array of middlewares
        middlewares = args[1];
        router = args[2]; // Third argument is the callback or Router
      } else if (typeof args[1] === "function") {
        // Second argument is a single middleware
        middlewares = [args[1]];
        router = args[2]; // Third argument is the callback or Router
      } else {
        // Only path is provided
        router = args[1];
      }
    } else if (typeof args[0] === "function") {
      // First argument is a middleware or callback
      if (args.length === 1) {
        // Only a callback is provided
        middlewares = [args[0]];
      } else {
        // First argument is middleware, second is callback or Router
        middlewares = [args[0]];
        router = args[1];
      }
    } else if (Array.isArray(args[0])) {
      // First argument is an array of middlewares
      middlewares = args[0];
      router = args[1];
    } else if (args[0] instanceof Router) {
      router = args[0];
    }

    if (middlewares?.length) {
      this.#addRoute("ALL", path, middlewares);
    }
    if (router && router instanceof Router) {
      this.addRouter(path, router);
    }
    return this;
  }

  /**
   * Internal helper to add a route to the registry.
   *
   * @param method - HTTP method
   * @param path - Normalized route path (basePath applied)
   * @param handlers - Array of middlewares + callback
   */
  #addRoute(method: HTTPMethod, path: string, handlers: HandlerType) {
    let pattern = `/${sanitizePathSplitBasePath(this.basePath, path).join("/")}`;
    this.router?.addRoute?.(method, pattern, handlers);
    this.routes.push({
      method: method,
      pattern: pattern,
      handlers: handlers,
    });
  }

  /**
   * Internal route registration method.
   *
   * Parses and validates handler arguments,
   * supporting middleware(s) and callback.
   *
   * @param method - HTTP method
   * @param path - Route path pattern
   * @param args - Middleware(s) and callback
   * @throws Error if no handler callback is provided or invalid
   */
  #registerRoute<U extends Record<string, any> = {}>(
    method: HTTPMethod,
    path: string,
    ...args: any[]
  ): void {
    // Determine middlewares and callback from the arguments
    // Ensure at least one argument is provided
    if (args.length === 0) {
      throw new Error("At least one handler is required.");
    }
    // Extract middlewares and callback
    let middlewares: Middleware<T & U>[] = [];
    let callback: Callback<T & U> | undefined;

    if (args.length > 1) {
      // If there are multiple arguments, the first argument may be middleware
      if (Array.isArray(args[0])) {
        middlewares = args[0]; // Middleware as an array
      } else if (typeof args[0] === "function") {
        middlewares = [args[0]]; // Middleware as a single function
      }
      callback = args[args.length - 1]; // Callback is the last argument
    } else {
      // If there is only one argument, it must be the callback
      callback = args[0];
    }

    // Validate callback
    if (typeof callback !== "function") {
      throw new Error("Route callback function is missing or invalid.");
    }
    if (!middlewares.every((middleware) => typeof middleware === "function")) {
      throw new Error(
        "Middleware must be a function or an array of functions.",
      );
    }
    this.#addRoute(method, path, [...middlewares, callback]);
  }
  #addRouterInstance<U extends Record<string, any> = {}>(
    path: string,
    router: Router<T & U>,
  ) {

    if (!(router instanceof Router)) {
      throw new Error("Router instance is required.");
    }
    router.routes.forEach((r) => {
      this.#addRoute(
        r?.method,
        `/${sanitizePathSplitBasePath(path, r?.pattern).join("/")}`,
        r?.handlers,
      );
    });
    Object.assign(this.staticFile, router.staticFile);
  }
}
