"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezX = void 0;
const colors_js_1 = require("../utils/colors.js");
const httpStatusMap_js_1 = require("../utils/httpStatusMap.js");
const params_js_1 = require("../utils/params.js");
const config_js_1 = require("./config.js");
const context_js_1 = require("./context.js");
const router_js_1 = require("./router.js");
class TezX extends router_js_1.Router {
    #onPathResolve;
    constructor({ basePath = "/", env = {}, debugMode = false, onPathResolve, allowDuplicateMw = false, overwriteMethod = true, } = {}) {
        config_js_1.GlobalConfig.allowDuplicateMw = allowDuplicateMw;
        config_js_1.GlobalConfig.overwriteMethod = overwriteMethod;
        if (debugMode) {
            config_js_1.GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env });
        this.#onPathResolve = onPathResolve;
        this.serve = this.serve.bind(this);
    }
    #hashRouter(method, pathname) {
        const routers = this.routers;
        for (let pattern of this.routers.keys()) {
            const { success, params } = (0, params_js_1.useParams)({
                path: pathname,
                urlPattern: pattern,
            });
            const handlers = routers.get(pattern)?.get(method) || routers.get(pattern)?.get("ALL");
            if (success && handlers) {
                return {
                    callback: handlers.callback,
                    middlewares: handlers.middlewares,
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
            this.#hashRouter(method, pathname) ||
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
                throw new Error(`Handler failed: Middleware chain incomplete or response missing. Did you forget ${colors_js_1.COLORS.bgRed} 'await next()' ${colors_js_1.COLORS.reset} or to return a response? ${colors_js_1.COLORS.bgCyan} Path: ${ctx.pathname}, Method: ${ctx.method} ${colors_js_1.COLORS.reset}`);
            }
            const resBody = res || ctx.body;
            return ctx.send(resBody, ctx.headers.toJSON());
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
            config_js_1.GlobalConfig.debugging.warn(`${colors_js_1.COLORS.white} PATH RESOLVE ${colors_js_1.COLORS.reset} ${colors_js_1.COLORS.red}${pathname}${colors_js_1.COLORS.reset} ➞ ${colors_js_1.COLORS.cyan}${resolvePath}${colors_js_1.COLORS.reset}`);
        }
        if (typeof resolvePath !== "string") {
            throw new Error(`Path resolution failed: expected a string, got ${typeof resolvePath}`);
        }
        return resolvePath;
    }
    async #handleRequest(req, options) {
        let ctx = new context_js_1.Context(req, options);
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
                combine.push(config_js_1.GlobalConfig.notFound);
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
                    const statusText = response?.statusText || httpStatusMap_js_1.httpStatusMap[response?.status] || "";
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
        config_js_1.GlobalConfig.debugging.error(`${colors_js_1.COLORS.bgRed} ${ctx.pathname}, Method: ${ctx.method} ${colors_js_1.COLORS.reset}`, `${httpStatusMap_js_1.httpStatusMap[500]}: ${error} `);
        let res = await config_js_1.GlobalConfig.onError(error, ctx);
        ctx.setStatus = res.status;
        return res;
    }
    async serve(req, options) {
        return this.#handleRequest(req, options);
    }
}
exports.TezX = TezX;
