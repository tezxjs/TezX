"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePathSplit = sanitizePathSplit;
exports.urlParse = urlParse;
function sanitizePathSplit(basePath, path) {
    const parts = `${basePath}/${path}`
        .replace(/\\/g, "")
        ?.split("/")
        .filter(Boolean);
    return parts;
}
function urlParse(url) {
    const urlPattern = /^(?:(\w+):\/\/)?(?:([^:@]+)?(?::([^@]+))?@)?([^:/?#]+)?(?::(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;
    let matches = url.match(urlPattern);
    if (!matches) {
        href: url;
    }
    const [_, protocol, username, password, hostname, port, path, queryString, hash,] = matches;
    let origin = hostname;
    if (protocol) {
        origin = protocol + "://" + hostname;
    }
    if (port) {
        origin = origin + ":" + port;
    }
    let p = path;
    if (p?.endsWith("/"))
        p.slice(0, -1);
    function query() {
        if (queryString) {
            const queryPart = decodeURIComponent(queryString);
            const keyValuePairs = queryPart.split("&");
            const paramsObj = keyValuePairs?.map((keyValue) => {
                const [key, value] = keyValue.split("=");
                return {
                    [key]: value,
                };
            });
            return paramsObj.reduce(function (total, value) {
                return { ...total, ...value };
            }, {});
        }
        else {
            return {};
        }
    }
    return {
        pathname: p,
        hash,
        protocol,
        origin,
        username,
        password,
        hostname,
        href: url,
        port,
        query: query(),
    };
}
