"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezX = void 0;
const colors_js_1 = require("../utils/colors.js");
const config_js_1 = require("./config.js");
const context_js_1 = require("./context.js");
const router_js_1 = require("./router.js");
const params_js_1 = require("../utils/params.js");
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
    #triRouter(method, pathname) {
        const parts = pathname.split("/").filter(Boolean);
        const params = {};
        let node = this.triRouter;
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
        const route = this.#triRouter(method, pathname) || this.#hashRouter(method, pathname);
        if (route) {
            return {
                ...route,
                middlewares: [...route.middlewares],
            };
        }
        return null;
    }
    #createHandler(middlewares, finalCallback) {
        return async (ctx) => {
            let index = 0;
            const next = async () => {
                if (index < middlewares.length) {
                    return await middlewares[index++](ctx, next);
                }
                else {
                    return await finalCallback(ctx);
                }
            };
            const response = await next();
            if (response instanceof Response) {
                return response;
            }
            if (!response && !ctx.body) {
                throw new Error(`Handler did not return a response or next() was not called. Path: ${ctx.pathname}, Method: ${ctx.method}`);
            }
            const resBody = response || ctx.body;
            return ctx.send(resBody, ctx.headers.toObject());
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
    async #handleRequest(req, options) {
        let ctx = new context_js_1.Context(req, options);
        const urlRef = ctx.req.urlRef;
        const { pathname } = urlRef;
        let resolvePath = pathname;
        if (this.#onPathResolve) {
            resolvePath = this.#onPathResolve(pathname);
            config_js_1.GlobalConfig.debugging.warn(`${colors_js_1.COLORS.white} PATH RESOLVE ${colors_js_1.COLORS.reset} ${colors_js_1.COLORS.red}${pathname}${colors_js_1.COLORS.reset} ➞ ${colors_js_1.COLORS.cyan}${resolvePath}${colors_js_1.COLORS.reset}`);
        }
        if (typeof resolvePath !== "string") {
            throw new Error(`Path resolution failed: expected a string, got ${typeof resolvePath}`);
        }
        let middlewares = this.#findMiddleware(resolvePath);
        ctx.env = this.env;
        try {
            let callback = async (ctx) => {
                const find = this.findRoute(ctx.req.method, resolvePath);
                if (find?.callback) {
                    ctx.params = find.params;
                    const callback = find.callback;
                    let middlewares = find.middlewares;
                    return (await this.#createHandler(middlewares, callback)(ctx));
                }
                else {
                    let res = (await config_js_1.GlobalConfig.notFound(ctx));
                    ctx.setStatus = res.status;
                    return res;
                }
            };
            let response = await this.#createHandler([...this.triMiddlewares.middlewares, ...middlewares], callback)(ctx);
            let finalResponse = () => {
                return (ctx) => {
                    if (response?.headers) {
                        ctx.headers.add(response.headers);
                    }
                    const statusText = response?.statusText || context_js_1.httpStatusMap[response?.status] || "";
                    const status = response.status || ctx.getStatus;
                    let headers = ctx.headers.toObject();
                    return new Response(response.body, {
                        status,
                        statusText,
                        headers,
                    });
                };
            };
            return finalResponse()(ctx);
        }
        catch (err) {
            let error = err;
            if (err instanceof Error) {
                error = err.stack;
            }
            config_js_1.GlobalConfig.debugging.error(`${colors_js_1.COLORS.bgRed} ${ctx.pathname}, Method: ${ctx.method} ${colors_js_1.COLORS.reset}`, `${context_js_1.httpStatusMap[500]}: ${error} `);
            let res = await config_js_1.GlobalConfig.onError(error, ctx);
            ctx.setStatus = res.status;
            return res;
        }
    }
    async serve(req, options) {
        return this.#handleRequest(req, options);
    }
}
exports.TezX = TezX;
