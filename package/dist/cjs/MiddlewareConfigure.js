"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriMiddleware = void 0;
const common_1 = require("./common");
const config_1 = require("./config/config");
const url_1 = require("./utils/url");
class TriMiddleware {
    constructor(pathname = "/") {
        this.children = new Map();
        this.middlewares = new Set();
        this.isOptional = false;
        this.pathname = pathname;
        if (config_1.GlobalConfig.allowDuplicateMw) {
            this.middlewares = []; // Array (DuplicateMiddlewares)
        }
        else {
            this.middlewares = new Set(); // Set (UniqueMiddlewares)
        }
    }
}
exports.TriMiddleware = TriMiddleware;
class MiddlewareConfigure extends common_1.CommonHandler {
    constructor(basePath = "/") {
        super();
        this.triMiddlewares = new TriMiddleware();
        this.basePath = basePath;
    }
    addMiddleware(pathname, middlewares) {
        // console.log(this.basePath)
        // console.log(pathname);
        const parts = (0, url_1.sanitizePathSplit)(this.basePath, pathname);
        // console.log(parts, this.basePath)
        // if (/(\/\*|\?)/.test(pathname)) {
        //     let path = parts.join("/");
        //     let handler = this.routeMiddlewares.get(path);
        //     if (!handler) {
        //         // handler.set(method, { callback: callback, middlewares });
        //         return this.routeMiddlewares.set(path, middlewares);
        //     }
        //     // console.log(this.routeMiddlewares, 35345)
        //     return handler.push(...middlewares);
        // }
        let node = this.triMiddlewares;
        for (const part of parts) {
            if (part.startsWith("*")) {
                if (!node.children.has("*")) {
                    node.children.set("*", new TriMiddleware());
                }
                node = node.children.get("*");
            }
            else if (part.startsWith(":")) {
                // Dynamic parameter (e.g., :id)
                const isOptional = part?.endsWith("?");
                if (isOptional) {
                    node.isOptional = isOptional;
                    continue;
                }
                if (!node.children.has(":")) {
                    node.children.set(":", new TriMiddleware());
                }
                node = node.children.get(":");
            }
            else {
                // Static path segment
                if (!node.children.has(part)) {
                    node.children.set(part, new TriMiddleware());
                }
                node = node.children.get(part);
            }
            // Optionally, you could store the parameter name in the node if needed
        }
        if (config_1.GlobalConfig.allowDuplicateMw) {
            node.middlewares.push(...middlewares);
        }
        else {
            for (const middleware of middlewares) {
                node.middlewares.add(middleware);
            }
        }
        // this.triMiddleware = new TriMiddleware(pathname);
        // this.triMiddleware.middlewares = middlewares;
    }
}
exports.default = MiddlewareConfigure;
