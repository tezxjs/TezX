"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriMiddleware = void 0;
const url_js_1 = require("../utils/url.js");
const common_js_1 = require("./common.js");
const config_js_1 = require("./config.js");
class TriMiddleware {
    children = new Map();
    middlewares = new Set();
    isOptional = false;
    pathname;
    constructor(pathname = "/") {
        this.pathname = pathname;
        if (config_js_1.GlobalConfig.allowDuplicateMw) {
            this.middlewares = [];
        }
        else {
            this.middlewares = new Set();
        }
    }
}
exports.TriMiddleware = TriMiddleware;
class MiddlewareConfigure extends common_js_1.CommonHandler {
    triMiddlewares = new TriMiddleware();
    basePath;
    constructor(basePath = "/") {
        super();
        this.basePath = basePath;
    }
    addMiddleware(pathname, middlewares) {
        const parts = (0, url_js_1.sanitizePathSplit)(this.basePath, pathname);
        let node = this.triMiddlewares;
        for (const part of parts) {
            if (part.startsWith("*")) {
                if (!node.children.has("*")) {
                    node.children.set("*", new TriMiddleware());
                }
                node = node.children.get("*");
            }
            else if (part.startsWith(":")) {
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
                if (!node.children.has(part)) {
                    node.children.set(part, new TriMiddleware());
                }
                node = node.children.get(part);
            }
        }
        if (config_js_1.GlobalConfig.allowDuplicateMw) {
            node.middlewares.push(...middlewares);
        }
        else {
            for (const middleware of middlewares) {
                node.middlewares.add(middleware);
            }
        }
    }
}
exports.default = MiddlewareConfigure;
