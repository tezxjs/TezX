import { sanitizePathSplit } from "../helper/index.js";
export class RadixRouter {
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
            if (type === 'static') {
                node = node.children[value] ??= { children: {} };
            }
            else if (type === 'dynamic') {
                if (!node.children[":"]) {
                    node.children[":"] = { children: {}, paramName, isOptional };
                }
                else if (node.children[":"]?.paramName !== paramName || node.children[":"]?.isOptional !== isOptional) {
                    throw new Error(`Conflicting param definition for ${paramName}`);
                }
                node = node.children[":"];
            }
            else if (type === 'wildcard') {
                node = node.children["*"] ??= { children: {}, paramName };
                break;
            }
        }
        node.isEndpoint = true;
        node.handlers ??= {};
        node.handlers[method] ??= [];
        node.handlers[method].push(...handlers || []);
    }
    search(method, path) {
        let params = {};
        let middlewares = [];
        const node = this._match(method, this.root, sanitizePathSplit(path), 0, params, middlewares, new Set());
        const handlers = node?.handlers?.[method] ?? [];
        return {
            method,
            params: handlers ? params : {},
            handlers: handlers,
            middlewares: middlewares
        };
    }
    _match(method, node, segments, index, params, middlewares, seen) {
        if (node.handlers?.ALL) {
            for (const mw of node.handlers.ALL) {
                if (!seen.has(mw)) {
                    seen.add(mw);
                    middlewares.push(mw);
                }
            }
        }
        if (index === segments.length) {
            if (node.isEndpoint && node.handlers?.[method])
                return node;
            const opt = node.children[':'];
            if (opt?.isOptional) {
                params[opt.paramName] = null;
                return this._match(method, opt, segments, index, params, middlewares, seen);
            }
            return;
        }
        const wc = node.children["*"];
        if (wc?.handlers?.ALL) {
            for (const mw of wc.handlers.ALL) {
                if (!seen.has(mw)) {
                    seen.add(mw);
                    middlewares.push(mw);
                }
            }
        }
        const seg = segments[index];
        if (node.children[seg]) {
            const res = this._match(method, node.children[seg], segments, index + 1, params, middlewares, seen);
            if (res)
                return res;
        }
        const dyn = node.children[':'];
        if (dyn) {
            params[dyn.paramName] = seg;
            const res = this._match(method, dyn, segments, index + 1, params, middlewares, seen);
            if (res)
                return res;
            if (dyn.isOptional) {
                params[dyn.paramName] = null;
                const skip = this._match(method, dyn, segments, index, params, middlewares, seen);
                if (skip)
                    return skip;
            }
        }
        if (wc) {
            let wildcard = segments.slice(index).join('/');
            if (wildcard) {
                params[wc.paramName] = wildcard;
                return wc;
            }
        }
        return;
    }
    mergeRouter(basePath, childRouter) {
        const segments = sanitizePathSplit(basePath);
        let node = this.root;
        for (const segment of segments) {
            node.children[segment] ??= { children: {} };
            node = node.children[segment];
        }
        if (childRouter.root.handlers) {
            node.isEndpoint = true;
            node.handlers ??= {};
            for (const method in childRouter.root.handlers) {
                node.handlers[method] ??= [];
                node.handlers[method].push(...childRouter.root.handlers?.[method] || []);
            }
        }
        Object.assign(node.children, childRouter.root.children);
    }
    parsePattern(pattern) {
        const segments = sanitizePathSplit(pattern);
        const result = [];
        for (const segment of segments) {
            if (segment === '*') {
                result.push({ type: 'wildcard', paramName: '*' });
                break;
            }
            else if (segment.startsWith('*')) {
                const paramName = segment.slice(1) || 'wildcard';
                result.push({ type: 'wildcard', paramName });
                break;
            }
            else if (segment.startsWith(':')) {
                const isOptional = segment.endsWith('?');
                const paramName = isOptional ? segment.slice(1, -1) : segment.slice(1);
                result.push({ type: 'dynamic', paramName, isOptional });
            }
            else {
                result.push({ type: 'static', value: segment });
            }
        }
        return result;
    }
}
