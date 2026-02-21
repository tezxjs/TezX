//src/core/server.ts
import { RadixRouter } from "../registry/RadixRouter.js";
import {
  Callback,
  Ctx,
  ErrorHandler,
  HttpBaseResponse,
  HTTPMethod,
  Middleware,
  RouteRegistry,
  WebSocketEvent
} from "../types/index.js";
import { handleErrorResponse, notFoundResponse } from "../utils/response.js";
import { getPathname } from "../utils/url.js";
import { Context } from "./context.js";
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
export class TezX<T extends Record<string, any> = {}> extends Router<T> {
  #notFound: Callback<any> = notFoundResponse;
  #errorHandler: ErrorHandler<T> = handleErrorResponse as ErrorHandler;
  /** Internal route registry to hold all routes */
  declare protected router?: RouteRegistry;

  constructor({ basePath = "/", routeRegistry = new RadixRouter() }: TezXConfig = {}) {
    super({ basePath });
    if (!routeRegistry) {
      throw new Error("routeRegistry is required for TezX initialization");
    }
    this.router = routeRegistry;
    this.serve = this.serve.bind(this) as any;
  }

  /**
   * Register a custom 404 (not found) handler.
   *
   * @param callback - Function to handle unmatched routes.
   * @returns The current TezX instance (for chaining).
   *
   * @example
   * app.notFound((ctx) => ctx.status(404).text("Oops! Page not found."));
   */
  public notFound(callback: Callback<T>): this {
    this.#notFound = callback;
    return this;
  }

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
  public onError(callback: ErrorHandler<T>): this {
    this.#errorHandler = callback;
    return this;
  }

  /**
   * Composes an array of middleware functions and executes them sequentially.
   *
   * Supports both synchronous and asynchronous middleware.
   * Automatically propagates errors and ensures `next()` is called only once per middleware.
   *
   * @param {Ctx<T>} ctx - The current request context.
   * @param {Middleware<T>[]} stack - Array of middleware functions to execute.
   * @returns {HttpBaseResponse | Promise<HttpBaseResponse>} The final response from the middleware chain.
   */
  #composeChain(ctx: Ctx<T>, stack: Middleware<T>[]): HttpBaseResponse | Promise<HttpBaseResponse> {
    let index = -1;

    const dispatch = (i: number): HttpBaseResponse | Promise<HttpBaseResponse> => {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));
      index = i;
      const fn = stack[i];
      if (!fn) return ctx.res!
      try {
        const result = fn(ctx, () => dispatch(i + 1) as unknown as Promise<void>);
        // If result is synchronous
        if (!(result instanceof Promise)) {
          if (result instanceof Response) ctx.res = result;
          return result as Response ?? ctx.res;
        }
        // If result is asynchronous
        return result.then(
          (res) => {
            if (res instanceof Response) ctx.res = res;
            return res as Response ?? ctx.res
          },
          (err) => Promise.reject(err)
        );
      }
      catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0);
  }

  async #handleRequest(req: Request, method: string, server: Bun.Server<WebSocketEvent>): Promise<Response> {
    const pathname = getPathname(req.url);
    const ctx = new Context(req, pathname, method, server) as Ctx<T>;
    try {
      // ------------------------
      // Static file shortcut
      // ------------------------
      const staticHandler = this.staticFile?.[`${method} ${pathname}`];
      if (staticHandler) return staticHandler(ctx);
      // ------------------------
      // Route lookup
      // ------------------------
      const result = this.router?.search(method as HTTPMethod, pathname);
      if (!result) return this.#notFound(ctx);
      const { match: middlewares, params } = result;

      const mLen = middlewares.length;
      if (mLen === 0) return this.#notFound(ctx);
      (ctx as any).params = params;

      // 6. Execution Strategy
      if (mLen === 1) {
        // Optimization: Direct call for single handler (No recursion overhead)
        ctx.res = await (middlewares[0] as Callback)(ctx);
      } else {
        // Composition for middleware chain
        ctx.res = await this.#composeChain(ctx, middlewares);
      }
      return ctx.res ?? this.#notFound(ctx);
    }
    catch (err) {
      let error = err instanceof Error ? err : new Error(String(err));
      return this.#errorHandler?.(error, ctx as Ctx<T>);
    }
  }

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
  public async serve(req: Request, server: Bun.Server<any>): Promise<Response> {
    const method = req.method;
    if (method === "HEAD") {
      const res = await this.#handleRequest(req, "GET", server);
      return new Response(null, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }
    return this.#handleRequest(req, method, server);
  }
}
