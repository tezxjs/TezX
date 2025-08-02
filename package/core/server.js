import { colorText } from "../utils/colors.js";
import { handleErrorResponse, notFoundResponse } from "../utils/response.js";
import { getPathname } from "../utils/url.js";
import { GlobalConfig } from "./config.js";
import { Context } from "./context.js";
import { Router } from "./router.js";
export class TezX extends Router {
    #pathResolver;
    #notFound = notFoundResponse;
    #errorHandler = handleErrorResponse;
    constructor({ basePath = "/", env = {}, debugMode = false, onPathResolve, routeRegistry, } = {}) {
        if (debugMode) {
            GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env, routeRegistry });
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
    async #resolvePath(pathname) {
        let resolvePath = pathname;
        if (this.#pathResolver) {
            resolvePath = await this.#pathResolver(pathname);
            GlobalConfig.debugging.warn(`${colorText(" PATH RESOLVE ", "white")} ${colorText(pathname, "red")} ➞ ${colorText(resolvePath, "cyan")}`);
        }
        if (typeof resolvePath !== "string") {
            throw new Error(`Path resolution failed: expected a string, got ${typeof resolvePath}`);
        }
        return resolvePath;
    }
    #chain(middlewares) {
        if (!Array.isArray(middlewares)) {
            throw new TypeError("Middleware stack must be an array!");
        }
        const len = middlewares.length;
        return async function (ctx) {
            let index = -1;
            async function dispatch(i) {
                if (i <= index) {
                    throw new Error("next() called multiple times");
                }
                index = i;
                if (i >= len)
                    return;
                const fn = middlewares[i];
                if (typeof fn !== "function") {
                    throw new TypeError(`Middleware at index ${i} must be a function`);
                }
                const result = await fn(ctx, () => dispatch(i + 1));
                if (result instanceof Response) {
                    ctx.res = result;
                }
                return ctx.res;
            }
            await dispatch(0);
            return ctx.res;
        };
    }
    async #handleRequest(req, args) {
        if (!(req instanceof Request)) {
            throw new Error("Invalid request object provided to tezX server.");
        }
        const method = (req.method ?? "GET").toUpperCase();
        const pathname = await this.#resolvePath(getPathname(req.url));
        let ctx = new Context(req, {
            pathname,
            method,
            env: this.env,
            args,
        });
        try {
            if (method === "HEAD") {
                const getRequest = new Request(req.url, { ...req, method: "GET" });
                const headResponse = await this.#handleRequest(getRequest, args);
                return new Response(null, {
                    status: headResponse.status,
                    statusText: headResponse.statusText,
                    headers: headResponse.headers,
                });
            }
            const staticKey = `${method} ${pathname}`;
            const staticHandler = this.staticFile?.[staticKey];
            if (staticHandler) {
                return staticHandler(ctx);
            }
            const route = this.router.search(method, pathname);
            if (!route ||
                (route.handlers.length === 0 && route.middlewares.length === 0)) {
                return this.#notFound(ctx);
            }
            ctx.params = route.params;
            if (route.handlers.length === 1 && route.middlewares.length === 0) {
                const result = await route.handlers[0](ctx);
                if (result)
                    return result;
                if (ctx.body !== undefined)
                    return ctx.send(ctx.body);
                return this.#notFound(ctx);
            }
            let res = await this.#chain([
                ...route.middlewares,
                ...route.handlers,
            ])(ctx);
            if (!res && ctx.body !== undefined) {
                res = ctx.send(ctx.body);
            }
            if (!res) {
                throw new Error(`Handler failed: No response returned. Did you forget ${colorText("await next()", "bgRed")} or to return a response? ${colorText(`Path: ${ctx.pathname}, Method: ${ctx.method}`, "bgCyan")}`);
            }
            return res;
        }
        catch (err) {
            return this.#errorHandler(err, ctx);
        }
    }
    async serve(req, ...args) {
        return this.#handleRequest(req, args);
    }
}
