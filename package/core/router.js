import { addBaseToRegex, compileRegexRoute } from "../utils/regexRouter.js";
import { getFiles } from "../utils/staticFile.js";
import { sanitizePathSplit, wildcardOrOptionalParamRegex, } from "../utils/url.js";
import { GlobalConfig } from "./config.js";
import MiddlewareConfigure, { TriMiddleware, } from "./MiddlewareConfigure.js";
export class TrieRouter {
    children = new Map();
    handlers = new Map();
    pathname;
    paramName;
    isParam = false;
    constructor(pathname = "/") {
        this.children = new Map();
        this.pathname = pathname;
    }
}
export class Router extends MiddlewareConfigure {
    routers = new Map();
    env = {};
    triRouter;
    constructor({ basePath = "/", env = {} } = {}) {
        super(basePath);
        this.basePath = basePath;
        this.env = { ...env };
        this.triRouter = new TrieRouter(basePath);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
        this.all = this.all.bind(this);
        this.addRouter = this.addRouter.bind(this);
        this.group = this.group.bind(this);
    }
    static(...args) {
        let route = "";
        let dir;
        let options = {};
        switch (args.length) {
            case 3:
                [route, dir, options] = args;
                break;
            case 2:
                if (typeof args[1] === "object") {
                    [dir, options] = args;
                }
                else {
                    [route, dir] = args;
                }
                break;
            case 1:
                [dir] = args;
                break;
            default:
                throw new Error(`\x1b[1;31m404 Not Found\x1b[0m \x1b[1;32mInvalid arguments\x1b[0m`);
        }
        getFiles(dir, route, this, options);
        return this;
    }
    get(path, ...args) {
        this.#registerRoute("GET", path, ...args);
        return this;
    }
    sse(path, handler) {
        this.get(path, async (ctx) => {
            let res = await handler(ctx);
            const headersMap = {};
            if (res instanceof Response) {
                for (const [key, value] of res.headers.entries()) {
                    headersMap[key.toLowerCase()] = value;
                }
                res = res.body;
            }
            const headers = {
                ...headersMap,
                "content-type": "text/event-stream",
                "cache-control": "no-cache",
                connection: "keep-alive",
            };
            return new Response(res, {
                status: 200,
                headers,
            });
        });
    }
    post(path, ...args) {
        this.#registerRoute("POST", path, ...args);
        return this;
    }
    put(path, ...args) {
        this.#registerRoute("PUT", path, ...args);
        return this;
    }
    patch(path, ...args) {
        this.#registerRoute("PATCH", path, ...args);
        return this;
    }
    delete(path, ...args) {
        this.#registerRoute("DELETE", path, ...args);
        return this;
    }
    options(path, ...args) {
        this.#registerRoute("OPTIONS", path, ...args);
        return this;
    }
    head(path, ...args) {
        this.#registerRoute("HEAD", path, ...args);
        return this;
    }
    all(path, ...args) {
        this.#registerRoute("ALL", path, ...args);
        return this;
    }
    addRoute(method, path, ...args) {
        this.#registerRoute(method, path, ...args);
        return this;
    }
    addRouter(path, router) {
        return this.#routeAddTriNode(path, router);
    }
    group(prefix, callback) {
        const router = new Router({
            basePath: prefix,
        });
        callback(router);
        this.#routeAddTriNode("/", router);
        return this;
    }
    use(...args) {
        let path = "/";
        let middlewares = [];
        let router;
        if (typeof args[0] === "string") {
            path = args[0];
            if (Array.isArray(args[1])) {
                middlewares = args[1];
                router = args[2];
            }
            else if (typeof args[1] === "function") {
                middlewares = [args[1]];
                router = args[2];
            }
            else {
                router = args[1];
            }
        }
        else if (typeof args[0] === "function") {
            if (args.length === 1) {
                middlewares = [args[0]];
            }
            else {
                middlewares = [args[0]];
                router = args[1];
            }
        }
        else if (Array.isArray(args[0])) {
            middlewares = args[0];
            router = args[1];
        }
        else if (args[0] instanceof Router) {
            router = args[0];
        }
        this.#addRouteMiddleware(path, middlewares);
        if (router && router instanceof Router) {
            this.addRouter(path, router);
        }
        return this;
    }
    #registerRoute(method, path, ...args) {
        if (args.length === 0) {
            throw new Error("At least one handler is required.");
        }
        let middlewares = [];
        let callback;
        if (args.length > 1) {
            if (Array.isArray(args[0])) {
                middlewares = args[0];
            }
            else if (typeof args[0] === "function") {
                middlewares = [args[0]];
            }
            callback = args[args.length - 1];
        }
        else {
            callback = args[0];
        }
        if (typeof callback !== "function") {
            throw new Error("Route callback function is missing or invalid.");
        }
        if (!middlewares.every((middleware) => typeof middleware === "function")) {
            throw new Error("Middleware must be a function or an array of functions.");
        }
        this.#addRoute(method, path, callback, middlewares);
    }
    #addRoute(method, path, callback, middlewares) {
        let finalMiddleware = middlewares;
        if (!GlobalConfig.allowDuplicateMw) {
            finalMiddleware = new Set(middlewares);
        }
        if (path instanceof RegExp) {
            let regex = addBaseToRegex(this.basePath, path);
            let regexPath = `regex://${regex?.source}`;
            let handler = this.routers.get(regexPath);
            if (!handler) {
                handler = new Map();
                handler.set(method, {
                    callback: callback,
                    paramNames: [],
                    regex: regex,
                    middlewares: finalMiddleware,
                });
                return this.routers.set(regexPath, handler);
            }
            if (!GlobalConfig.overwriteMethod && handler.has(method))
                return;
            return handler.set(method, {
                callback: callback,
                paramNames: [],
                regex: regex,
                middlewares: finalMiddleware
            });
        }
        const parts = sanitizePathSplit(this.basePath, path);
        let p = parts.join("/");
        if (wildcardOrOptionalParamRegex.test(`/${p}`)) {
            let strPath = `string://${p}`;
            let { paramNames, regex } = compileRegexRoute(parts);
            let handler = this.routers.get(strPath);
            if (!handler) {
                handler = new Map();
                handler.set(method, {
                    callback: callback,
                    regex: regex,
                    paramNames: paramNames,
                    middlewares: finalMiddleware,
                });
                return this.routers.set(strPath, handler);
            }
            if (!GlobalConfig.overwriteMethod && handler.has(method))
                return;
            return handler.set(method, {
                callback: callback,
                regex: regex,
                paramNames: paramNames,
                middlewares: finalMiddleware
            });
        }
        let node = this.triRouter;
        for (const part of parts) {
            if (part.startsWith(":")) {
                if (!node.children.has(":")) {
                    node.children.set(":", new TrieRouter());
                }
                node = node.children.get(":");
                node.isParam = true;
                if (!node.paramName) {
                    node.paramName = part.slice(1);
                }
            }
            else {
                if (!node.children.has(part)) {
                    node.children.set(part, new TrieRouter());
                }
                node = node.children.get(part);
            }
        }
        if (!GlobalConfig.overwriteMethod && node.handlers.has(method))
            return;
        node.handlers.set(method, {
            callback: callback,
            middlewares: finalMiddleware,
        });
        node.pathname = `/${p}`;
    }
    #addRouteMiddleware(path, middlewareFunctions) {
        this.addMiddleware(path, middlewareFunctions);
    }
    #routeAddTriNode(path, router) {
        this.env = { ...this.env, ...router.env };
        if (!(router instanceof Router)) {
            throw new Error("Router instance is required.");
        }
        const parts = sanitizePathSplit(this.basePath, path);
        if (router.routers.size) {
            for (const [segment, handlers] of router.routers) {
                if (segment.indexOf("string://") == 0) {
                    let pattern = segment.replace(/^string:\/\//, "");
                    let joined = [...parts, pattern].join("/");
                    let strPath = `string://${joined}`;
                    if (this.routers.has(strPath)) {
                        const baseRouter = this.routers.get(strPath);
                        for (const [method, handler] of handlers) {
                            let { regex, paramNames } = baseRouter?.get(method);
                            handler.regex = regex;
                            handler.paramNames = paramNames;
                            if (!GlobalConfig.overwriteMethod && baseRouter.has(method))
                                continue;
                            baseRouter.set(method, handler);
                        }
                    }
                    else {
                        let h = new Map();
                        for (const [method, { callback, middlewares }] of handlers) {
                            let { paramNames, regex } = compileRegexRoute(joined);
                            h.set(method, {
                                callback: callback,
                                middlewares: middlewares,
                                paramNames,
                                regex
                            });
                        }
                        this.routers.set(strPath, h);
                    }
                }
                else {
                    let pattern = segment.replace("regex://", "");
                    let base = parts?.join("/");
                    let regex = addBaseToRegex(base, new RegExp(pattern));
                    let regexPath = `regex://${regex.source}`;
                    if (this.routers.has(regexPath)) {
                        const baseRouter = this.routers.get(regexPath);
                        for (const [method, handler] of handlers) {
                            handler.regex = regex;
                            handler.paramNames = [];
                            if (!GlobalConfig.overwriteMethod && baseRouter.has(method))
                                continue;
                            baseRouter.set(method, handler);
                        }
                    }
                    else {
                        let h = new Map();
                        for (const [method, { callback, middlewares }] of handlers) {
                            h.set(method, {
                                callback: callback,
                                middlewares: middlewares,
                                paramNames: [],
                                regex
                            });
                        }
                        this.routers.set(regexPath, h);
                    }
                }
            }
        }
        let rootNode = this.triRouter;
        let rootMiddlewares = this.triMiddlewares;
        if (parts.length == 0) {
            this.#addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router);
        }
        else {
            for (const part of parts) {
                if (part.startsWith(":")) {
                    if (!rootNode.children.has(":")) {
                        rootNode.children.set(":", new TrieRouter());
                    }
                    rootNode = rootNode.children.get(":");
                    rootNode.isParam = true;
                    if (!rootNode.paramName) {
                        rootNode.paramName = part.slice(1);
                    }
                }
                else {
                    if (!rootNode.children.has(part)) {
                        rootNode.children.set(part, new TrieRouter());
                    }
                    rootNode = rootNode.children.get(part);
                }
            }
            for (const part of parts) {
                if (part.startsWith("*")) {
                    if (!rootMiddlewares.children.has("*")) {
                        rootMiddlewares.children.set("*", new TriMiddleware());
                    }
                    rootMiddlewares = rootMiddlewares.children.get("*");
                }
                else if (part.startsWith(":")) {
                    const isOptional = part?.endsWith("?");
                    if (isOptional) {
                        rootMiddlewares.isOptional = isOptional;
                        continue;
                    }
                    if (!rootMiddlewares.children.has(":")) {
                        rootMiddlewares.children.set(":", new TriMiddleware());
                    }
                    rootMiddlewares = rootMiddlewares.children.get(":");
                }
                else {
                    if (!rootMiddlewares.children.has(part)) {
                        rootMiddlewares.children.set(part, new TriMiddleware());
                    }
                    rootMiddlewares = rootMiddlewares.children.get(part);
                }
            }
            this.#addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router);
        }
    }
    #addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router) {
        function addSubRouter(children, node) {
            let rtN = node;
            for (const element of children) {
                const pathSegment = element[0];
                const subRouter = element[1];
                if (rtN.children.has(pathSegment)) {
                    let findNode = rtN.children.get(pathSegment);
                    for (const [method, handlers] of subRouter.handlers) {
                        if (!GlobalConfig.overwriteMethod && node.handlers.has(method))
                            return;
                        findNode.handlers.set(method, handlers);
                    }
                    if (subRouter.children.size) {
                        addSubRouter(subRouter.children, findNode);
                    }
                }
                else {
                    rtN.children.set(pathSegment, subRouter);
                }
            }
        }
        let routerNode = router.triRouter;
        const routerMiddlewares = router.triMiddlewares;
        for (const [method, handlers] of routerNode.handlers) {
            if (!GlobalConfig.overwriteMethod) {
                rootNode.handlers.set(method, handlers);
                continue;
            }
            if (!rootNode.handlers.has(method)) {
                rootNode.handlers.set(method, handlers);
            }
        }
        if (routerNode.children.size > 0) {
            addSubRouter(routerNode.children, rootNode);
        }
        function addMiddleware(children, node) {
            let n = node;
            for (const [path, middlewareNode] of children) {
                if (n.children.has(path)) {
                    let findNode = n.children.get(path);
                    if (GlobalConfig.allowDuplicateMw) {
                        findNode.middlewares.push(...middlewareNode.middlewares);
                    }
                    else {
                        for (const mw of middlewareNode.middlewares) {
                            if (findNode.middlewares.has(mw)) {
                                middlewareNode.middlewares.delete(mw);
                            }
                            findNode.middlewares.add(mw);
                        }
                    }
                    if (middlewareNode.children.size) {
                        addMiddleware(middlewareNode.children, findNode);
                    }
                }
                else {
                    n.children.set(path, middlewareNode);
                }
            }
        }
        if (GlobalConfig.allowDuplicateMw) {
            rootMiddlewares.middlewares.push(...routerMiddlewares.middlewares);
        }
        else {
            for (const mw of routerMiddlewares.middlewares) {
                if (rootMiddlewares.middlewares.has(mw)) {
                    routerMiddlewares.middlewares.delete(mw);
                }
                rootMiddlewares.middlewares.add(mw);
            }
        }
        if (routerMiddlewares.children.size > 0) {
            addMiddleware(routerMiddlewares.children, rootMiddlewares);
        }
    }
}
