"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezX = void 0;
const RadixRouter_js_1 = require("../registry/RadixRouter.js");
const response_js_1 = require("../utils/response.js");
const url_js_1 = require("../utils/url.js");
const config_js_1 = require("./config.js");
const context_js_1 = require("./context.js");
const error_js_1 = require("./error.js");
const router_js_1 = require("./router.js");
class TezX extends router_js_1.Router {
    #pathResolver;
    #notFound = response_js_1.notFoundResponse;
    #errorHandler = response_js_1.handleErrorResponse;
    constructor({ basePath = "/", env = {}, debugMode = false, onPathResolve, routeRegistry = new RadixRouter_js_1.RadixRouter(), } = {}) {
        if (debugMode) {
            config_js_1.GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env });
        if (!routeRegistry) {
            throw new Error("routeRegistry is required for TezX initialization");
        }
        this.router = routeRegistry;
        this.#pathResolver = onPathResolve;
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
    async #chain(ctx, mLen, middlewares, hLen, handlers) {
        let index = -1;
        let res;
        async function dispatch(i) {
            if (i <= index)
                throw new error_js_1.TezXError("next() called multiple times");
            index = i;
            if (i < mLen) {
                const fn = middlewares[i];
                if (typeof fn !== "function")
                    throw new TypeError(`Middleware[${i}] must be a function`);
                res = (await fn(ctx, () => dispatch(i + 1)));
                if (res !== undefined) {
                    ctx.res = res;
                }
                return ctx.res;
            }
            const hi = i - mLen;
            if (hi < hLen) {
                const fn = handlers[hi];
                if (typeof fn !== "function")
                    throw new TypeError(`Handler[${hi}] must be a function`);
                res = (await fn(ctx, () => dispatch(i + 1)));
                if (res !== undefined) {
                    ctx.res = res;
                }
                return ctx.res;
            }
        }
        await dispatch(0);
        return (ctx.res ??
            (ctx.body !== undefined ? ctx.send(ctx.body) : this.#notFound(ctx)));
    }
    async #handleRequest(req, method, args) {
        if (!(req instanceof Request))
            throw new error_js_1.TezXError("Invalid request object provided to tezX server.");
        const rawPath = (0, url_js_1.getPathname)(req.url);
        const pathname = this.#pathResolver
            ? await this.#pathResolver(rawPath)
            : rawPath;
        const ctx = new context_js_1.Context(req, pathname, method, this.env, args);
        try {
            const staticHandler = this.staticFile?.[`${method} ${pathname}`];
            if (staticHandler) {
                return staticHandler(ctx);
            }
            const route = this.router?.search(method, pathname);
            const mLen = route?.middlewares?.length;
            const hLen = route?.handlers?.length;
            if (!route || (hLen === 0 && mLen === 0)) {
                return this.#notFound(ctx);
            }
            ctx.params = route.params;
            if (hLen === 1 && mLen === 0) {
                return ((await route.handlers[0](ctx)) ??
                    (ctx.body !== undefined ? ctx.send(ctx.body) : this.#notFound(ctx)));
            }
            return await this.#chain(ctx, mLen, route.middlewares, hLen, route.handlers);
        }
        catch (err) {
            return this.#errorHandler?.((0, error_js_1.TezXErrorParse)(err), ctx);
        }
    }
    async serve(req, ...args) {
        const method = (req.method ?? "GET").toUpperCase();
        if (method === "HEAD") {
            const getRequest = new Request(req.url, { ...req, method: "GET" });
            const headResponse = await this.#handleRequest(getRequest, method, args);
            return new Response(null, {
                status: headResponse.status,
                statusText: headResponse.statusText,
                headers: headResponse.headers,
            });
        }
        return this.#handleRequest(req, method, args);
    }
}
exports.TezX = TezX;
if (!globalThis.TezX) {
    globalThis.TezX = TezX;
}
