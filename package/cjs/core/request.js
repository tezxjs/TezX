"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const formData_js_1 = require("../utils/formData.js");
const url_js_1 = require("../utils/url.js");
const config_js_1 = require("./config.js");
const environment_js_1 = require("./environment.js");
const header_js_1 = require("./header.js");
class Request {
    #headers = new header_js_1.HeadersParser();
    url;
    method;
    urlRef = {
        hash: undefined,
        protocol: undefined,
        origin: undefined,
        username: undefined,
        password: undefined,
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
    constructor(req, params, options) {
        this.remoteAddress = options?.connInfo?.remoteAddr;
        this.#headers = new header_js_1.HeadersParser(req?.headers);
        this.method = req?.method?.toUpperCase();
        this.params = params;
        this.rawRequest = req;
        if (environment_js_1.EnvironmentDetector.getEnvironment == "node" ||
            config_js_1.GlobalConfig.adapter == "node") {
            let encrypted = req?.socket?.encrypted;
            const protocol = typeof encrypted === "boolean"
                ? encrypted
                    ? "https"
                    : "http"
                : "http";
            const host = environment_js_1.EnvironmentDetector.getHost(this.#headers);
            const path = req.url || "/";
            this.url = `${protocol}://${host}${path}`;
        }
        else {
            this.url = req.url;
        }
        this.urlRef = (0, url_js_1.urlParse)(this.url);
        this.query = this.urlRef.query;
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
