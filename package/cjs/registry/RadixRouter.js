"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadixRouter = void 0;
const url_js_1 = require("../utils/url.js");
class RadixRouter {
    root = { children: {} };
    name;
    constructor() {
        this.name = "RadixRouter";
    }
    addRoute(method, path, handlers) {
        const segments = this.parsePattern(path);
        let node = this.root;
        for (let i = 0; i < segments.length; i++) {
            const { type, value, paramName, isOptional } = segments[i];
            if (type === "static") {
                node = node.children[value] ??= { children: {} };
            }
            else if (type === "dynamic") {
                if (!node.children[":"]) {
                    node.children[":"] = { children: {}, paramName, isOptional };
                }
                else if (node.children[":"]?.paramName !== paramName ||
                    node.children[":"]?.isOptional !== isOptional) {
                    throw new Error(`Conflicting param definition for ${paramName}`);
                }
                node = node.children[":"];
            }
            else if (type === "wildcard") {
                node = node.children["*"] ??= { children: {}, paramName };
                break;
            }
        }
        node.isEndpoint = true;
        node.handlers ??= {};
        node.handlers[method] ??= [];
        node.handlers[method].push(...(handlers || []));
    }
    search(method, path) {
        let params = {};
        let middlewares = [];
        const segments = path?.split("/")?.filter(Boolean);
        const { success, node } = this._match(method, this.root, segments, 0, params, middlewares);
        const list = node?.handlers?.[method];
        if (success && list) {
            for (let i = 0; i < list.length; i++) {
                middlewares.push(list[i]);
            }
        }
        return { method, params, match: middlewares };
    }
    _match(method, node, segments, index, params, middlewares) {
        if (node?.handlers?.ALL) {
            const mw = node.handlers?.ALL;
            for (let i = 0; i < mw.length; i++) {
                middlewares.push(mw[i]);
            }
        }
        if (index === segments.length) {
            if (node.isEndpoint && node.handlers?.[method])
                return { success: true, node };
            const opt = node.children[":"];
            if (opt?.isOptional) {
                params[opt.paramName] = null;
                return this._match(method, opt, segments, index, params, middlewares);
            }
            return { success: false, node: node };
        }
        const wc = node.children["*"];
        const seg = segments[index];
        if (node.children[seg]) {
            const res = this._match(method, node.children[seg], segments, index + 1, params, middlewares);
            if (res.success) {
                if (wc?.handlers?.ALL) {
                    const mw = wc.handlers?.ALL;
                    for (let i = 0; i < mw.length; i++) {
                        middlewares.push(mw[i]);
                    }
                }
                return res;
            }
        }
        const dyn = node.children[":"];
        if (dyn) {
            params[dyn.paramName] = seg;
            const res = this._match(method, dyn, segments, index + 1, params, middlewares);
            if (res.success) {
                if (wc?.handlers?.ALL) {
                    const mw = wc.handlers?.ALL;
                    for (let i = 0; i < mw.length; i++) {
                        middlewares.push(mw[i]);
                    }
                }
                return res;
            }
            if (dyn.isOptional) {
                params[dyn.paramName] = null;
                const skip = this._match(method, dyn, segments, index, params, middlewares);
                if (skip.success) {
                    if (wc?.handlers?.ALL) {
                        const mw = wc.handlers?.ALL;
                        for (let i = 0; i < mw.length; i++) {
                            middlewares.push(mw[i]);
                        }
                    }
                    return skip;
                }
            }
        }
        if (wc) {
            let wildcard = segments.slice(index).join("/");
            if (wc?.handlers?.ALL) {
                const mw = wc.handlers?.ALL;
                for (let i = 0; i < mw.length; i++) {
                    middlewares.push(mw[i]);
                }
            }
            if (wildcard) {
                params[wc.paramName] = wildcard;
                return { node: wc, success: true };
            }
        }
        return { success: false, node };
    }
    parsePattern(pattern) {
        const segments = (0, url_js_1.sanitizePathSplit)(pattern);
        const result = [];
        for (const segment of segments) {
            if (segment === "*") {
                result.push({ type: "wildcard", paramName: "*" });
                break;
            }
            else if (segment.startsWith("*")) {
                const paramName = segment.slice(1) || "*";
                result.push({ type: "wildcard", paramName });
                break;
            }
            else if (segment.startsWith(":")) {
                const isOptional = segment.endsWith("?");
                const paramName = isOptional ? segment.slice(1, -1) : segment.slice(1);
                result.push({ type: "dynamic", paramName, isOptional });
            }
            else {
                result.push({ type: "static", value: segment });
            }
        }
        return result;
    }
}
exports.RadixRouter = RadixRouter;
