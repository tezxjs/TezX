import { colorText } from "../utils/colors.js";
import { httpStatusMap } from "../utils/httpStatusMap.js";
import { regexMatchRoute } from "../utils/regexRouter.js";
import { GlobalConfig } from "./config.js";
import { Context } from "./context.js";
import { Router } from "./router.js";
export class TezX extends Router {
    #onPathResolve;
    constructor({ basePath = "/", env = {}, debugMode = false, onPathResolve, allowDuplicateMw = false, overwriteMethod = true, } = {}) {
        GlobalConfig.allowDuplicateMw = allowDuplicateMw;
        GlobalConfig.overwriteMethod = overwriteMethod;
        if (debugMode) {
            GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env });
        this.#onPathResolve = onPathResolve;
        this.serve = this.serve.bind(this);
    }
    #regexRouter(method, pathname) {
        for (let pattern of this.routers.values()) {
            const handler = pattern?.get(method) || pattern?.get("ALL");
            const { success, params } = regexMatchRoute(handler?.regex, pathname, handler?.paramNames || []);
            if (success && handler) {
                return {
                    callback: handler.callback,
                    middlewares: handler.middlewares,
                    params: params,
                };
            }
        }
        return null;
    }
    #triRouter(method, pathname, priority = "static") {
        const parts = pathname.split("/").filter(Boolean);
        const params = {};
        let node = this.triRouter;
        if (priority == "static") {
            for (let part of parts) {
                if (node.children.has(part)) {
                    node = node.children.get(part);
                }
                else if (node.children.has(":")) {
                    node = node.children.get(":");
                    if (node.paramName)
                        params[node.paramName] = part;
                }
                else {
                    return null;
                }
            }
        }
        else {
            for (let part of parts) {
                if (node.children.has(":")) {
                    node = node.children.get(":");
                    if (node.paramName)
                        params[node.paramName] = part;
                }
                else if (node.children.has(part)) {
                    node = node.children.get(part);
                }
                else {
                    return null;
                }
            }
        }
        if (node?.handlers?.size && node?.pathname) {
            const handlers = node.handlers.get(method) || node.handlers.get("ALL");
            if (handlers) {
                return {
                    middlewares: handlers.middlewares,
                    callback: handlers.callback,
                    params: params,
                };
            }
            return null;
        }
        return null;
    }
    findRoute(method, pathname) {
        const route = this.#triRouter(method, pathname) ||
            this.#regexRouter(method, pathname) ||
            this.#triRouter(method, pathname, "param");
        if (route) {
            return {
                ...route,
                middlewares: [...route.middlewares],
            };
        }
        return null;
    }
    #createHandler(middlewares) {
        return async (ctx) => {
            let index = 0;
            let response = undefined;
            const next = async () => {
                if (index >= middlewares.length) {
                    return;
                }
                const currentMiddleware = middlewares[index++];
                try {
                    const result = await currentMiddleware(ctx, next);
                    if (result instanceof Response) {
                        ctx.res = result;
                    }
                    if (result !== undefined) {
                        response = result;
                    }
                    return response;
                }
                catch (err) {
                    ctx.body = err;
                    throw err;
                }
            };
            let res = await next();
            if (res instanceof Response) {
                return res;
            }
            if (typeof res == "function" && ctx.wsProtocol) {
                return res;
            }
            if (!res && !ctx.body) {
                throw new Error(`Handler failed: Middleware chain incomplete or response missing. Did you forget ${colorText(" await next() ", "bgRed")} or to return a response? ${colorText(` Path: ${ctx.pathname}, Method: ${ctx.method} `, "bgCyan")}`);
            }
            const resBody = res || ctx.body;
            const toJson = {};
            for (const [key, value] of ctx.headers.entries()) {
                toJson[key] = value;
            }
            return ctx.send(resBody, toJson);
        };
    }
    #findMiddleware(pathname) {
        const parts = pathname.split("/").filter(Boolean);
        let middlewares = [];
        let node = this.triMiddlewares;
        for (let part of parts) {
            if (node.children.has(part)) {
                node = node.children.get(part);
            }
            else if (node.children.has("*")) {
                node = node.children.get("*");
            }
            else if (node.children.has(":")) {
                node = node.children.get(":");
            }
            else {
                break;
            }
            middlewares.push(...node.middlewares);
        }
        return middlewares;
    }
    async #resolvePath(pathname) {
        let resolvePath = pathname;
        if (this.#onPathResolve) {
            resolvePath = await this.#onPathResolve(pathname);
            GlobalConfig.debugging.warn(`${colorText(" PATH RESOLVE ", "white")} ${colorText(pathname, "red")} ➞ ${colorText(resolvePath, "cyan")}`);
        }
        if (typeof resolvePath !== "string") {
            throw new Error(`Path resolution failed: expected a string, got ${typeof resolvePath}`);
        }
        return resolvePath;
    }
    async #handleRequest(req, options) {
        let ctx = new Context(req, options);
        const urlRef = ctx.req.urlRef;
        const { pathname } = urlRef;
        let resolvePath = await this.#resolvePath(pathname);
        let middlewares = this.#findMiddleware(resolvePath);
        ctx.env = this.env;
        try {
            let combine = [...this.triMiddlewares.middlewares, ...middlewares];
            const find = this.findRoute(ctx.req.method, resolvePath);
            if (find?.callback) {
                ctx.params = find.params;
                const callback = find.callback;
                let routeMiddlewares = find.middlewares || [];
                combine.push(...routeMiddlewares, callback);
            }
            else {
                ctx.setStatus = 404;
                combine.push(GlobalConfig.notFound);
            }
            let response = await this.#createHandler(combine)(ctx);
            if (ctx.wsProtocol) {
                if (typeof response == "function") {
                    return {
                        websocket: response,
                        ctx: ctx,
                    };
                }
                return response;
            }
            let finalResponse = () => {
                return (ctx) => {
                    let headers = response?.headers;
                    for (const [key, value] of headers.entries()) {
                        ctx.headers.set(key, value);
                    }
                    const statusText = response?.statusText || httpStatusMap[response?.status] || "";
                    const status = response.status || ctx.getStatus;
                    return new Response(response.body, {
                        status,
                        statusText,
                        headers: ctx.headers,
                    });
                };
            };
            return finalResponse()(ctx);
        }
        catch (err) {
            return this.#handleError(err, ctx);
        }
    }
    async #handleError(err, ctx) {
        let error = err;
        if (err instanceof Error) {
            error = err.stack;
        }
        GlobalConfig.debugging.error(`${colorText(` ${ctx.pathname}, Method: ${ctx.method} `, "bgRed")}`, `${httpStatusMap[500]}: ${error} `);
        let res = await GlobalConfig.onError(error, ctx);
        ctx.setStatus = res.status;
        return res;
    }
    async serve(req, options) {
        return this.#handleRequest(req, options);
    }
}
