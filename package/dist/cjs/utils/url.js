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
    // const queryRegex = /\?([^#]*)/,
    //     authRegex = /\/\/(?:([^:]+)(?::([^@]+)))?/,
    //     pathnameRegex = /(?:^[^:]+:\/\/[^/]+)?(\/[^?#]*)/,
    //     portRegex = /:(\d+)/,
    //     hashRegex = /#([^]*)/,
    //     protocolRegex = /^(?:([^:]+):\/\/)?(?:([^:]+))/,
    //     urlRegex = /^(?:(\w+):\/\/)?(?:([^:]+)(?::([^@]+))?@)?([a-zA-Z0-9.-]+|(?:\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\])(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;
    // function query() {
    //     // Extract the query part of the URL
    //     const queryMatch = url.match(queryRegex);
    //     if (queryMatch && queryMatch[1]) {
    //         const queryPart = decodeURIComponent(queryMatch[1]);
    //         // Split the query into individual key-value pairs
    //         const keyValuePairs = queryPart.split('&')
    //         const paramsObj: Array<{ [key: string]: any }> = keyValuePairs?.map(keyValue => {
    //             const [key, value] = keyValue.split('=');
    //             return {
    //                 [key]: value
    //             }
    //         });
    //         return paramsObj.reduce(function (total: any, value: any) {
    //             return { ...total, ...value }
    //         }, {});
    //     } else {
    //         return {}
    //     }
    // }
    let matches = url.match(urlPattern);
    // if (!matches) {
    //     const hashMatch = url.match(hashRegex);
    //     console.log(hashMatch)
    //     matches = [null, null, null, null, null, null, null, null, hashMatch && hashMatch[1] || null]
    // }
    if (!matches) {
        href: url;
    } // Return raw URL if no match
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
            // Split the query into individual key-value pairs
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
