import { COLORS } from "../utils/colors";
import { GlobalConfig } from "./config";
import { Context, httpStatusMap } from "./context";
import { Router } from "./router";
import { useParams } from "../utils/params";
export class TezX extends Router {
    constructor({ basePath = "/", env = {}, debugMode = false, allowDuplicateMw = false, overwriteMethod = true, } = {}) {
        GlobalConfig.allowDuplicateMw = allowDuplicateMw;
        GlobalConfig.overwriteMethod = overwriteMethod;
        if (debugMode) {
            GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env });
        this.serve = this.serve.bind(this);
    }
    #hashRouter(method, pathname) {
        const routers = this.routers;
        for (let pattern of this.routers.keys()) {
            const { success, params } = useParams({
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
    async #handleRequest(req, connInfo) {
        let ctx = new Context(req, connInfo);
        const urlRef = ctx.req.urlRef;
        const { pathname } = urlRef;
        let middlewares = this.#findMiddleware(pathname);
        ctx.env = this.env;
        try {
            let callback = async (ctx) => {
                const find = this.findRoute(ctx.req.method, pathname);
                if (find?.callback) {
                    ctx.params = find.params;
                    const callback = find.callback;
                    let middlewares = find.middlewares;
                    return (await this.#createHandler(middlewares, callback)(ctx));
                }
                else {
                    let res = await GlobalConfig.notFound(ctx);
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
                    const statusText = response?.statusText || httpStatusMap[response?.status] || "";
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
            GlobalConfig.debugging.error(`${COLORS.bgRed} ${ctx.pathname}, Method: ${ctx.method} ${COLORS.reset}`, `${httpStatusMap[500]}: ${error} `);
            let res = await GlobalConfig.onError(error, ctx);
            ctx.setStatus = res.status;
            return res;
        }
    }
    async serve(req, connInfo) {
        return this.#handleRequest(req, connInfo);
    }
}
