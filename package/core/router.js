import { sanitizePathSplitBasePath } from "../utils/low-level.js";
import { TezXError } from "./error.js";
export class Router {
    env = {};
    router;
    route = [];
    staticFile = Object.create(null);
    basePath;
    constructor({ basePath = "/", env = {} } = {}) {
        this.basePath = basePath;
        this.env = { ...env };
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
        this.all = this.all.bind(this);
        this.addRouter = this.addRouter.bind(this);
        this.group = this.group.bind(this);
    }
    static(serveStatic) {
        if (Array.isArray(serveStatic?.files)) {
            serveStatic?.files.forEach((r) => {
                this.staticFile[`GET ${r?.route}`] = (ctx) => {
                    if (serveStatic?.options?.cacheControl) {
                        ctx.setHeader("Cache-Control", serveStatic?.options.cacheControl);
                    }
                    let headers = serveStatic?.options?.headers;
                    if (headers) {
                        for (const key in headers) {
                            let value = headers?.[key];
                            ctx.headers.set(key, value);
                        }
                    }
                    return ctx.sendFile(r.fileSource);
                };
            });
        }
        return this;
    }
    get(path, ...args) {
        this.#registerRoute("GET", path, ...args);
        return this;
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
    all(path, ...args) {
        this.#registerRoute("ALL", path, ...args);
        return this;
    }
    when(methods, path, ...args) {
        const methodList = Array.isArray(methods) ? methods : [methods];
        for (const method of methodList) {
            this.#registerRoute(method.toUpperCase(), path, ...args);
        }
        return this;
    }
    addRouter(path, router) {
        return this.#addRouterInstance(path, router);
    }
    group(prefix, callback) {
        const router = new Router({
            basePath: prefix,
        });
        callback(router);
        this.#addRouterInstance("/", router);
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
        if (middlewares?.length) {
            this.#addRoute("ALL", path, middlewares);
        }
        if (router && router instanceof Router) {
            this.addRouter(path, router);
        }
        return this;
    }
    #addRoute(method, path, handlers) {
        let pattern = `/${sanitizePathSplitBasePath(this.basePath, path).join("/")}`;
        this.router?.addRoute(method, pattern, handlers);
        this.route.push({
            method: method,
            pattern: pattern,
            handlers: handlers,
        });
    }
    #registerRoute(method, path, ...args) {
        if (args.length === 0) {
            throw new TezXError("At least one handler is required.");
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
            throw new TezXError("Route callback function is missing or invalid.");
        }
        if (!middlewares.every((middleware) => typeof middleware === "function")) {
            throw new TezXError("Middleware must be a function or an array of functions.");
        }
        this.#addRoute(method, path, [...middlewares, callback]);
    }
    #addRouterInstance(path, router) {
        this.env = { ...this.env, ...router.env };
        if (!(router instanceof Router)) {
            throw new TezXError("Router instance is required.");
        }
        router.route.forEach((r) => {
            this.#addRoute(r?.method, `/${sanitizePathSplitBasePath(path, r?.pattern).join("/")}`, r?.handlers);
        });
        Object.assign(this.staticFile, router.staticFile);
    }
}
