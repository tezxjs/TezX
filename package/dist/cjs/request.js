"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Request_request;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const environment_1 = require("./environment");
const header_1 = require("./header");
const formData_1 = require("./utils/formData");
const url_1 = require("./utils/url");
// type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ALL";
class Request {
    // static statusText: string;
    // static bodyUsed: boolean;
    constructor(req, params) {
        this.headers = new header_1.HeadersParser();
        /** Parsed URL reference containing components like query parameters, pathname, etc. */
        this.urlRef = {
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
        _Request_request.set(this, void 0);
        /**
         * Retrieve a parameter by name.
         * @param name - The parameter name.
         * @returns The parameter value if found, or undefined.
         */
        this.params = {};
        this.headers = new header_1.HeadersParser(req?.headers);
        this.method = req?.method?.toUpperCase();
        this.params = params;
        __classPrivateFieldSet(this, _Request_request, req, "f");
        if (environment_1.EnvironmentDetector.getEnvironment == "node") {
            const protocol = environment_1.EnvironmentDetector.detectProtocol(req);
            const host = environment_1.EnvironmentDetector.getHost(this.headers);
            this.url = `${protocol}://${host}${req.url}`;
        }
        else {
            this.url = req.url;
        }
        this.urlRef = (0, url_1.urlParse)(this.url);
        this.query = this.urlRef.query;
    }
    /**
     * Parses the request body as plain text.
     * @returns {Promise<string>} The text content of the request body.
     */
    async text() {
        return await (0, formData_1.parseTextBody)(__classPrivateFieldGet(this, _Request_request, "f"));
    }
    /**
     * Parses the request body as JSON.
     * @returns {Promise<Record<string, any>>} The parsed JSON object.
     * If the Content-Type is not 'application/json', it returns an empty object.
     */
    async json() {
        const contentType = this.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await (0, formData_1.parseJsonBody)(__classPrivateFieldGet(this, _Request_request, "f"));
        }
        else {
            return {};
        }
    }
    /**
     * Parses the request body based on Content-Type.
     * Supports:
     * - application/json → JSON parsing
     * - application/x-www-form-urlencoded → URL-encoded form parsing
     * - multipart/form-data → Multipart form-data parsing (for file uploads)
     * @returns {Promise<Record<string, any>>} The parsed form data as an object.
     * @throws {Error} If the Content-Type is missing or invalid.
     */
    async formData(options) {
        const contentType = this.headers.get("content-type") || "";
        if (!contentType) {
            throw Error("Invalid Content-Type");
        }
        if (contentType.includes("application/json")) {
            return await (0, formData_1.parseJsonBody)(__classPrivateFieldGet(this, _Request_request, "f"));
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            return (0, formData_1.parseUrlEncodedBody)(__classPrivateFieldGet(this, _Request_request, "f"));
        }
        else if (contentType.includes("multipart/form-data")) {
            const boundary = contentType?.split("; ")?.[1]?.split("=")?.[1];
            if (!boundary) {
                throw Error("Boundary not found");
            }
            return await (0, formData_1.parseMultipartBody)(__classPrivateFieldGet(this, _Request_request, "f"), boundary, options);
        }
        else {
            return {};
        }
    }
}
exports.Request = Request;
_Request_request = new WeakMap();
