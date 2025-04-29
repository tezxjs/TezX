"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const formData_js_1 = require("../utils/formData.js");
const header_js_1 = require("./header.js");
class Request {
    #headers = new header_js_1.HeadersParser();
    url;
    method;
    urlRef = {
        protocol: undefined,
        origin: undefined,
        hostname: undefined,
        port: undefined,
        href: undefined,
        query: {},
        pathname: "/",
    };
    query;
    rawRequest;
    params = {};
    remoteAddress = {};
    constructor({ headers, params, req, options, urlRef, }) {
        this.remoteAddress = options?.connInfo?.remoteAddr;
        this.#headers = headers;
        this.url = urlRef.href || "";
        this.urlRef = urlRef;
        this.method = req?.method?.toUpperCase();
        this.params = params;
        this.rawRequest = req;
        this.query = urlRef.query;
    }
    get headers() {
        let requestHeaders = this.#headers;
        return {
            get: function get(key) {
                return requestHeaders.get(key.toLowerCase());
            },
            getAll: function getAll(key) {
                return requestHeaders.get(key.toLowerCase()) || [];
            },
            has: function has(key) {
                return requestHeaders.has(key.toLowerCase());
            },
            entries: function entries() {
                return requestHeaders.entries();
            },
            keys: function keys() {
                return requestHeaders.keys();
            },
            values: function values() {
                return requestHeaders.values();
            },
            forEach: function forEach(callback) {
                return requestHeaders.forEach(callback);
            },
            toObject: function toObject() {
                return requestHeaders.toObject();
            },
        };
    }
    async text() {
        return await (0, formData_js_1.parseTextBody)(this.rawRequest);
    }
    async json() {
        const contentType = this.#headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await (0, formData_js_1.parseJsonBody)(this.rawRequest);
        }
        else {
            return {};
        }
    }
    async formData(options) {
        const contentType = this.#headers.get("content-type") || "";
        if (!contentType) {
            throw Error("Invalid Content-Type");
        }
        if (contentType.includes("application/json")) {
            return await (0, formData_js_1.parseJsonBody)(this.rawRequest);
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            return (0, formData_js_1.parseUrlEncodedBody)(this.rawRequest);
        }
        else if (contentType.includes("multipart/form-data")) {
            const boundary = contentType?.split("; ")?.[1]?.split("=")?.[1];
            if (!boundary) {
                throw Error("Boundary not found");
            }
            return await (0, formData_js_1.parseMultipartBody)(this.rawRequest, boundary, options);
        }
        else {
            return {};
        }
    }
}
exports.Request = Request;
