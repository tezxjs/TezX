var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Router_instances, _a, _Router_registerRoute, _Router_addRoute, _Router_addRouteMiddleware, _Router_routeAddTriNode, _Router_addMiddlewareHandlerIDsTriNode;
//src/router.ts
import { GlobalConfig } from "./config/config";
import MiddlewareConfigure, { TriMiddleware, } from "./MiddlewareConfigure";
import { getFiles } from "./utils/staticFile";
import { sanitizePathSplit } from "./utils/url";
class TrieRouter {
    constructor(pathname = "/") {
        this.children = new Map();
        // handlers: Map<HTTPMethod, Callback<any>> = new Map();
        this.handlers = new Map();
        this.isParam = false;
        this.children = new Map();
        this.pathname = pathname;
    }
}
export class Router extends MiddlewareConfigure {
    constructor({ basePath = "/", env = {} } = {}) {
        super(basePath);
        _Router_instances.add(this);
        this.routers = new Map();
        this.env = {};
        this.basePath = basePath;
        // GlobalConfig.env = { ...GlobalConfig.env, ...env };
        this.env = { ...env };
        this.triRouter = new TrieRouter(basePath);
        this.get.bind(this);
        this.post.bind(this);
        this.put.bind(this);
        this.delete.bind(this);
        this.all.bind(this);
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_routeAddTriNode).bind(this);
        this.addRouter.bind(this);
        this.group.bind(this);
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
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "GET", path, ...args);
        return this;
    }
    post(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "POST", path, ...args);
        return this;
    }
    put(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "PUT", path, ...args);
        return this;
    }
    patch(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "PATCH", path, ...args);
        return this;
    }
    delete(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "DELETE", path, ...args);
        return this;
    }
    options(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "OPTIONS", path, ...args);
        return this;
    }
    head(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "HEAD", path, ...args);
        return this;
    }
    all(path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, "ALL", path, ...args);
        return this;
    }
    addRoute(method, path, ...args) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_registerRoute).call(this, method, path, ...args);
        return this;
    }
    /**
     * Mount a sub-router at specific path prefix
     * @param path - Base path for the sub-router
     * @param router - Router instance to mount
     * @returns Current instance for chaining
     *
     * @example
     * const apiRouter = new Router();
     * apiRouter.get('/users', () => { ... });
     * server.addRouter('/api', apiRouter);
     */
    addRouter(path, router) {
        return __classPrivateFieldGet(this, _Router_instances, "m", _Router_routeAddTriNode).call(this, path, router);
    }
    /**
     * Create route group with shared path prefix
     * @param prefix - Path prefix for the group
     * @param callback - Function that receives group-specific router
     * @returns Current router instance for chaining
     *
     * @example
     * app.group('/v1', (group) => {
     *   group.get('/users', v1UserHandler);
     * });
     */
    group(prefix, callback) {
        const router = new _a({
            basePath: prefix,
            // env: this.env
        });
        callback(router);
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_routeAddTriNode).call(this, "/", router);
        return this;
    }
    use(...args) {
        let path = "/"; // Default path
        let middlewares = [];
        let router;
        if (typeof args[0] === "string") {
            // First argument is a path
            path = args[0];
            if (Array.isArray(args[1])) {
                // Second argument is an array of middlewares
                middlewares = args[1];
                router = args[2]; // Third argument is the callback or Router
            }
            else if (typeof args[1] === "function") {
                // Second argument is a single middleware
                middlewares = [args[1]];
                router = args[2]; // Third argument is the callback or Router
            }
            else {
                // Only path is provided
                router = args[1];
            }
        }
        else if (typeof args[0] === "function") {
            // First argument is a middleware or callback
            if (args.length === 1) {
                // Only a callback is provided
                middlewares = [args[0]];
            }
            else {
                // First argument is middleware, second is callback or Router
                middlewares = [args[0]];
                router = args[1];
            }
        }
        else if (Array.isArray(args[0])) {
            // First argument is an array of middlewares
            middlewares = args[0];
            router = args[1];
        }
        else if (args[0] instanceof _a) {
            router = args[0];
        }
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_addRouteMiddleware).call(this, path, middlewares);
        if (router && router instanceof _a) {
            this.addRouter(path, router);
        }
        return this;
    }
}
_a = Router, _Router_instances = new WeakSet(), _Router_registerRoute = function _Router_registerRoute(method, path, ...args) {
    // Determine middlewares and callback from the arguments
    // Ensure at least one argument is provided
    if (args.length === 0) {
        throw new Error("At least one handler is required.");
    }
    // Extract middlewares and callback
    let middlewares = [];
    let callback;
    if (args.length > 1) {
        // If there are multiple arguments, the first argument may be middleware
        if (Array.isArray(args[0])) {
            middlewares = args[0]; // Middleware as an array
        }
        else if (typeof args[0] === "function") {
            middlewares = [args[0]]; // Middleware as a single function
        }
        callback = args[args.length - 1]; // Callback is the last argument
    }
    else {
        // If there is only one argument, it must be the callback
        callback = args[0];
    }
    // Validate callback
    if (typeof callback !== "function") {
        throw new Error("Route callback function is missing or invalid.");
    }
    // Validate middlewares
    if (!middlewares.every((middleware) => typeof middleware === "function")) {
        throw new Error("Middleware must be a function or an array of functions.");
    }
    // const handler = this.#createHandler(middlewares, callback);
    __classPrivateFieldGet(this, _Router_instances, "m", _Router_addRoute).call(this, method, path, callback, middlewares);
}, _Router_addRoute = function _Router_addRoute(method, path, callback, middlewares) {
    const parts = sanitizePathSplit(this.basePath, path);
    let finalMiddleware = middlewares;
    if (!GlobalConfig.allowDuplicateMw) {
        finalMiddleware = new Set(middlewares);
    }
    let p = parts.join("/");
    if (/(\/\*|\?)/.test(p)) {
        let handler = this.routers.get(p);
        if (!handler) {
            handler = new Map();
            handler.set(method, {
                callback: callback,
                middlewares: finalMiddleware,
            });
            return this.routers.set(p, handler);
        }
        if (!GlobalConfig.overwriteMethod && handler.has(method))
            return;
        return handler.set(method, { callback, middlewares: finalMiddleware });
    }
    let node = this.triRouter;
    for (const part of parts) {
        if (part.startsWith(":")) {
            // Dynamic parameter (e.g., :id)
            if (!node.children.has(":")) {
                node.children.set(":", new TrieRouter());
            }
            node = node.children.get(":");
            node.isParam = true;
            if (!node.paramName) {
                node.paramName = part.slice(1);
            }
            // node.paramName = part.slice(1); // Extract parameter name
        }
        else {
            // Static path segment
            if (!node.children.has(part)) {
                node.children.set(part, new TrieRouter());
            }
            node = node.children.get(part);
        }
        // Optionally, you could store the parameter name in the node if needed
    }
    if (!GlobalConfig.overwriteMethod && node.handlers.has(method))
        return;
    node.handlers.set(method, {
        callback: callback,
        middlewares: finalMiddleware,
    });
    // node.middlewares = middlewares;
    node.pathname = path; // Save the original route for later param extraction
    // node.method = method;
}, _Router_addRouteMiddleware = function _Router_addRouteMiddleware(path, middlewareFunctions) {
    this.addMiddleware(path, middlewareFunctions);
}, _Router_routeAddTriNode = function _Router_routeAddTriNode(path, router) {
    this.env = { ...this.env, ...router.env };
    if (!(router instanceof _a)) {
        throw new Error("Router instance is required.");
    }
    const parts = sanitizePathSplit(this.basePath, path);
    // this.env = {...this.env, }
    // ! ❤️‍🔥handle for routers DONE; with ids
    if (router.routers.size) {
        for (const [segment, handlers] of router.routers) {
            let path = parts.length ? parts.join("/") + "/" + segment : segment;
            if (this.routers.has(path)) {
                const baseRouter = this.routers.get(path);
                for (const [method, handler] of handlers) {
                    if (!GlobalConfig.overwriteMethod && baseRouter.has(method))
                        return;
                    baseRouter.set(method, handler);
                }
            }
            else {
                this.routers.set(path, new Map(handlers)); // Ensure a new map is stored
            }
        }
    }
    let rootNode = this.triRouter;
    let rootMiddlewares = this.triMiddlewares;
    // !❤️‍🔥DONE
    if (parts.length == 0) {
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_addMiddlewareHandlerIDsTriNode).call(this, rootNode, rootMiddlewares, router);
    }
    else {
        // Summary:
        // 1. This loop processes both routing and middleware assignment in a single pass.
        // 2. Wildcard segments ('*') create a middleware node and move to it.
        // 3. Dynamic route parameters (':param') store the parameter name and handle optional parameters.
        // 4. Static paths are mapped directly in the trie structure.
        // 5. Middleware nodes mirror the route nodes to apply middlewares at the correct path levels.
        // 6. The approach ensures O(N) time complexity, making it efficient for large-scale routing.
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
            // Optionally, you could store the parameter name in the node if needed
        }
        // ! FOR MIDDLEWARE
        for (const part of parts) {
            if (part.startsWith("*")) {
                if (!rootMiddlewares.children.has("*")) {
                    rootMiddlewares.children.set("*", new TriMiddleware());
                }
                rootMiddlewares = rootMiddlewares.children.get("*");
            }
            else if (part.startsWith(":")) {
                // Dynamic parameter (e.g., :id)
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
                // Static path segment
                if (!rootMiddlewares.children.has(part)) {
                    rootMiddlewares.children.set(part, new TriMiddleware());
                }
                rootMiddlewares = rootMiddlewares.children.get(part);
            }
        }
        __classPrivateFieldGet(this, _Router_instances, "m", _Router_addMiddlewareHandlerIDsTriNode).call(this, rootNode, rootMiddlewares, router);
    }
}, _Router_addMiddlewareHandlerIDsTriNode = function _Router_addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router) {
    function addSubRouter(children, node) {
        let rtN = node; // Root node ke current node hisebe set kora
        // Looping through all child routers
        for (const element of children) {
            const pathSegment = element[0]; // Current path segment
            const subRouter = element[1]; // TrieRouter object
            // Check kortechi je current node er children e ei segment ache kina
            if (rtN.children.has(pathSegment)) {
                // Jodi thake, tahole existing node ta retrieve kori
                let findNode = rtN.children.get(pathSegment);
                // Sub-router er shob method handlers (GET, POST, etc.) ke existing node e merge kori
                for (const [method, handlers] of subRouter.handlers) {
                    if (!GlobalConfig.overwriteMethod && node.handlers.has(method))
                        return;
                    findNode.handlers.set(method, handlers); // Existing node e new handlers add kora
                }
                // // Merge method handlers (GET, POST, etc.)
                // for (const [method, handlers] of subRouter.handlers) {
                // }
                // subRouter.handlers.clear(); // Original sub-router er handlers clear kore dei
                // Jodi sub-router er children thake, tahole recursively abar function call kore merge kori
                if (subRouter.children.size) {
                    addSubRouter(subRouter.children, findNode);
                }
            }
            else {
                // Jodi parent e ei segment na thake, tahole direct add kore dei
                rtN.children.set(pathSegment, subRouter);
                // Jodi kono sub-router e children thake, ta clear kore dei, karon eta alrady merge hoyeche
                // subRouter.children.clear();
            }
        }
        // console.log(rtN.children)
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
    //  ! FOR MIDDLEWARE
    function addMiddleware(children, node) {
        let n = node; // Root node ke current node hisebe set kora
        // Looping through all middleware children
        for (const [path, middlewareNode] of children) {
            // Jodi already path ta parent node e thake
            if (n.children.has(path)) {
                let findNode = n.children.get(path); // Existing node ta retrieve kori
                // **Middleware Merge:** New middlewares ke existing node er sathe add kori
                if (GlobalConfig.allowDuplicateMw) {
                    findNode.middlewares.push(...middlewareNode.middlewares);
                    // (middlewareNode.middlewares as DuplicateMiddlewares).length = 0;
                }
                else {
                    for (const mw of middlewareNode.middlewares) {
                        if (findNode.middlewares.has(mw)) {
                            middlewareNode.middlewares.delete(mw);
                        }
                        findNode.middlewares.add(mw);
                    }
                    // (middlewareNode.middlewares as UniqueMiddlewares).clear();
                }
                // **Recursive Merge:** Jodi nested middleware children thake, tahole abar call kori
                if (middlewareNode.children.size) {
                    addMiddleware(middlewareNode.children, findNode);
                }
            }
            else {
                // Jodi path root e na thake, tahole direct add kori
                n.children.set(path, middlewareNode);
                // **Clearing Middlewares & Children:** Jeno extra memory na use hoy
                // if (GlobalConfig.allowDuplicateMw) {
                //     (middlewareNode.middlewares as DuplicateMiddlewares).length = 0;
                // }
                // else {
                //     (middlewareNode.middlewares as UniqueMiddlewares).clear();
                // }
                // middlewareNode.children.clear();
            }
        }
    }
    if (GlobalConfig.allowDuplicateMw) {
        rootMiddlewares.middlewares.push(...routerMiddlewares.middlewares);
        // (routerMiddlewares.middlewares as DuplicateMiddlewares).length = 0;
    }
    else {
        for (const mw of routerMiddlewares.middlewares) {
            if (rootMiddlewares.middlewares.has(mw)) {
                routerMiddlewares.middlewares.delete(mw);
            }
            rootMiddlewares.middlewares.add(mw);
        }
        // (routerMiddlewares.middlewares as UniqueMiddlewares).clear();
    }
    if (routerMiddlewares.children.size > 0) {
        addMiddleware(routerMiddlewares.children, rootMiddlewares);
    }
};
