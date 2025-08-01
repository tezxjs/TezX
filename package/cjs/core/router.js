"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const low_level_js_1 = require("../utils/low-level.js");
const RadixRouter_js_1 = require("../registry/RadixRouter.js");
class Router {
    env = {};
    router;
    route = [];
    staticFileRouter = Object.create(null);
    basePath;
    constructor({ basePath = "/", env = {}, routeRegistry = new RadixRouter_js_1.RadixRouter() } = {}) {
        this.router = routeRegistry;
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
                this.staticFileRouter[`GET ${r?.route}`] = (ctx) => {
                    if (serveStatic?.options?.cacheControl) {
                        ctx.setHeader("Cache-Control", serveStatic?.options.cacheControl);
                    }
                    let headers = serveStatic?.options?.headers;
                    if (headers) {
                        for (const key in headers) {
                            let value = headers?.[key];
                            ctx.setHeader(key, value);
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
        if (middlewares?.length) {
            this.#addRoute("ALL", path, middlewares);
        }
        if (router && router instanceof Router) {
            this.addRouter(path, router);
        }
        return this;
    }
    #addRoute(method, path, handlers, skip = false) {
        let pattern = `/${(0, low_level_js_1.sanitizePathSplitBasePath)(this.basePath, path).join("/")}`;
        if (!skip) {
            this.router.addRoute(method, pattern, handlers);
        }
        this.route.push({
            method: method,
            pattern: pattern,
            handlers: handlers
        });
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
        this.#addRoute(method, path, [...middlewares, callback]);
    }
    #routeAddTriNode(path, router) {
        this.env = { ...this.env, ...router.env };
        if (this.router.name &&
            router.router.name &&
            this.router.name !== router.router.name) {
            throw new Error(`Router name mismatch: expected "${this.router.name}", got "${router.router.name}"`);
        }
        if (!(router instanceof Router)) {
            throw new Error("Router instance is required.");
        }
        if (this.router?.mergeRouter) {
            const parts = (0, low_level_js_1.sanitizePathSplitBasePath)(this.basePath, path);
            router.route.forEach(r => {
                this.#addRoute(r?.method, `/${(0, low_level_js_1.sanitizePathSplitBasePath)(path, r?.pattern).join("/")}`, r?.handlers, true);
            });
            this.router.mergeRouter(`/${parts.join("/")}`, router.router);
        }
        else {
            router.route.forEach(r => {
                this.#addRoute(r?.method, `/${(0, low_level_js_1.sanitizePathSplitBasePath)(path, r?.pattern).join("/")}`, r?.handlers);
            });
        }
        Object.assign(this.staticFileRouter, router.staticFileRouter);
    }
}
exports.Router = Router;
