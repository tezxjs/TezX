"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wildcardOrOptionalParamRegex = void 0;
exports.sanitizePathSplit = sanitizePathSplit;
exports.urlParse = urlParse;
function normalizePath(path) {
    return ("/" + path.replace(/\\/g, "").replace(/\/+/g, "/").replace(/^\/+/, ""));
}
function sanitizePathSplit(basePath, path) {
    const parts = `${basePath}/${path}`
        .replace(/\\/g, "")
        .replace(/\/+/g, "/")
        ?.split("/")
        .filter(Boolean);
    return parts;
}
exports.wildcardOrOptionalParamRegex = /\/\*|:[^/]+[?*]/;
function urlParse(url) {
    let u = URL.parse(url);
    let query = {};
    if (u?.search) {
        new URLSearchParams(u?.search).forEach((value, key) => {
            query[key] = value;
        });
    }
    return {
        pathname: u?.pathname,
        query: query,
        protocol: u?.protocol,
        origin: u?.origin,
        hostname: u?.hostname,
        href: url,
        port: u?.port,
    };
}
