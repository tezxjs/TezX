import { parseJsonBody, parseMultipartBody, parseTextBody, parseUrlEncodedBody, } from "../utils/formData.js";
import { HeadersParser } from "./header.js";
export class Request {
    #headers = new HeadersParser();
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
        return await parseTextBody(this.rawRequest);
    }
    async json() {
        const contentType = this.#headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await parseJsonBody(this.rawRequest);
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
            return await parseJsonBody(this.rawRequest);
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            return parseUrlEncodedBody(this.rawRequest);
        }
        else if (contentType.includes("multipart/form-data")) {
            const boundaryMatch = contentType.match(/boundary=([^;]+)/);
            if (!boundaryMatch) {
                throw new Error("Boundary not found in multipart/form-data");
            }
            const boundary = boundaryMatch[1];
            return await parseMultipartBody(this.rawRequest, boundary, options);
        }
        else {
            return {};
        }
    }
}
