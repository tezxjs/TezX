import { sanitized } from "../utils/formData.js";
import { urlParse } from "../utils/url.js";
export class Request {
    url;
    method;
    pathname;
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
    constructor({ params, method, req, options, }) {
        let parse = urlParse(req.url);
        let url = parse?.href;
        this.remoteAddress = options?.connInfo?.remoteAddr;
        this.url = url || "";
        this.urlRef = parse;
        this.method = method;
        this.params = params;
        this.rawRequest = req;
        this.pathname = parse.pathname;
        this.query = parse.query;
    }
    get headers() {
        let requestHeaders = this.rawRequest.headers;
        return {
            get: function get(key) {
                return requestHeaders.get(key.toLowerCase());
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
            forEach: function forEach(callbackfn) {
                return requestHeaders.forEach(callbackfn);
            },
            toJSON() {
                const obj = {};
                for (const [key, value] of requestHeaders.entries()) {
                    obj[key] = value;
                }
                return obj;
            },
        };
    }
    async text() {
        return await this.rawRequest.text();
    }
    async json() {
        const contentType = this.rawRequest.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await this.rawRequest.json();
        }
        else {
            return {};
        }
    }
    async formData(options) {
        const contentType = this.rawRequest.headers.get("content-type") || "";
        if (!contentType) {
            throw Error("Invalid Content-Type");
        }
        if (contentType.includes("application/json")) {
            return await this.rawRequest.json();
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await this.rawRequest.formData();
            const result = {};
            for (const [key, value] of formData.entries()) {
                result[key] = value;
            }
            return result;
        }
        else if (contentType.includes("multipart/form-data")) {
            const boundaryMatch = contentType.match(/boundary=([^;]+)/);
            if (!boundaryMatch) {
                throw new Error("Boundary not found in multipart/form-data");
            }
            const formData = await this.rawRequest.formData();
            const result = {};
            for (const [key, value] of formData.entries()) {
                let val = value;
                if (val instanceof File && typeof options == "object") {
                    let filename = val.name;
                    if (options?.sanitized) {
                        filename = `${Date.now()}-${sanitized(filename)}`;
                    }
                    if (Array.isArray(options?.allowedTypes) &&
                        !options.allowedTypes?.includes(val.type)) {
                        throw new Error(`Invalid file type: "${val.type}". Allowed types: ${options.allowedTypes.join(", ")}`);
                    }
                    if (typeof options?.maxSize !== "undefined" &&
                        val.size > options.maxSize) {
                        throw new Error(`File size exceeds the limit: ${val.size} bytes (Max: ${options.maxSize} bytes)`);
                    }
                    if (typeof options?.maxFiles != "undefined" &&
                        options.maxFiles == 0) {
                        throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                    }
                    val = new File([await val.arrayBuffer()], filename, {
                        type: val.type,
                    });
                }
                if (result[key]) {
                    if (Array.isArray(result[key])) {
                        if (val instanceof File &&
                            typeof options?.maxFiles != "undefined" &&
                            result[key]?.length >= options.maxFiles) {
                            throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                        }
                        result[key].push(val);
                    }
                    else {
                        if (val instanceof File &&
                            typeof options?.maxFiles != "undefined" &&
                            options.maxFiles == 1) {
                            throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                        }
                        result[key] = [result[key], val];
                    }
                }
                else {
                    result[key] = val;
                }
            }
            return result;
        }
        else {
            return {};
        }
    }
}
