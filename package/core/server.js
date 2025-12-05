import { RadixRouter } from "../registry/RadixRouter.js";
import { handleErrorResponse, notFoundResponse } from "../utils/response.js";
import { getPathname } from "../utils/url.js";
import { Context } from "./context.js";
import { Router } from "./router.js";
export class TezX extends Router {
    #pathResolver;
    #notFound = notFoundResponse;
    #errorHandler = handleErrorResponse;
    constructor({ basePath = "/", routeRegistry = new RadixRouter(), } = {}) {
        super({ basePath });
        if (!routeRegistry) {
            throw new Error("routeRegistry is required for TezX initialization");
        }
        this.router = routeRegistry;
        this.serve = this.serve.bind(this);
    }
    notFound(callback) {
        this.#notFound = callback;
        return this;
    }
    onError(callback) {
        this.#errorHandler = callback;
        return this;
    }
    #composeChain(ctx, stack) {
        let index = -1;
        const dispatch = (i) => {
            if (i <= index)
                throw new Error("next() called multiple times");
            index = i;
            const fn = stack[i];
            if (!fn)
                return ctx.res;
            const result = fn(ctx, () => dispatch(i + 1));
            if (!(result instanceof Promise)) {
                if (result instanceof Response)
                    ctx.res = result;
                return ctx.res;
            }
            return result.then((res) => {
                if (res instanceof Response)
                    ctx.res = res;
                return ctx.res;
            }, (err) => {
                throw err;
            });
        };
        return dispatch(0);
    }
    async #handleRequest(req, method, server) {
        const pathname = getPathname(req.url);
        const ctx = new Context(req, pathname, method, server);
        try {
            const staticHandler = this.staticFile?.[`${method} ${pathname}`];
            if (staticHandler)
                return staticHandler(ctx);
            const result = this.router?.search(method, pathname);
            if (!result)
                return this.#notFound(ctx);
            const { match: middlewares, params } = result;
            const mLen = middlewares.length;
            if (mLen === 0)
                return this.#notFound(ctx);
            ctx.params = params;
            if (mLen === 1)
                return await middlewares[0](ctx) ?? this.#notFound(ctx);
            return await this.#composeChain(ctx, middlewares) ?? this.#notFound(ctx);
        }
        catch (err) {
            let error = err instanceof Error ? err : new Error(String(err));
            return this.#errorHandler?.(error, ctx);
        }
    }
    async serve(req, server) {
        const method = req.method || "GET";
        if (method === "HEAD") {
            const headReq = new Request(req, { method: "GET" });
            const res = await this.#handleRequest(headReq, "GET", server);
            return new Response(null, {
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
            });
        }
        return this.#handleRequest(req, method, server);
    }
}
