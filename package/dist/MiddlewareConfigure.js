import { CommonHandler } from "./common";
import { GlobalConfig } from "./config/config";
import { sanitizePathSplit } from "./utils/url";
export class TriMiddleware {
    constructor(pathname = "/") {
        this.children = new Map();
        this.middlewares = new Set();
        this.isOptional = false;
        this.pathname = pathname;
        if (GlobalConfig.allowDuplicateMw) {
            this.middlewares = []; // Array (DuplicateMiddlewares)
        }
        else {
            this.middlewares = new Set(); // Set (UniqueMiddlewares)
        }
    }
}
export default class MiddlewareConfigure extends CommonHandler {
    constructor(basePath = "/") {
        super();
        this.triMiddlewares = new TriMiddleware();
        this.basePath = basePath;
    }
    addMiddleware(pathname, middlewares) {
        // console.log(this.basePath)
        // console.log(pathname);
        const parts = sanitizePathSplit(this.basePath, pathname);
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
        if (GlobalConfig.allowDuplicateMw) {
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
