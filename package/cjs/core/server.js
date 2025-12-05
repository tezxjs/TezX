"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezX = void 0;
const RadixRouter_js_1 = require("../registry/RadixRouter.js");
const response_js_1 = require("../utils/response.js");
const url_js_1 = require("../utils/url.js");
const context_js_1 = require("./context.js");
const router_js_1 = require("./router.js");
class TezX extends router_js_1.Router {
    #pathResolver;
    #notFound = response_js_1.notFoundResponse;
    #errorHandler = response_js_1.handleErrorResponse;
    constructor({ basePath = "/", routeRegistry = new RadixRouter_js_1.RadixRouter(), } = {}) {
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
        const pathname = (0, url_js_1.getPathname)(req.url);
        const ctx = new context_js_1.Context(req, pathname, method, server);
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
exports.TezX = TezX;
