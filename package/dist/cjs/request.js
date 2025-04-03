"use strict";
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
    constructor(req, params, remoteAddress) {
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
        /**
         * Retrieve a parameter by name.
         * @param name - The parameter name.
         * @returns The parameter value if found, or undefined.
         */
        this.params = {};
        /**
         * Represents the remote address details of a connected client.
         *
         * @property {TransportType} [transport] - The transport protocol used (e.g., `"tcp"`, `"udp"`).
         * @property {"IPv4" | "IPv6" | "Unix"} [family] - The address family, indicating whether the connection is over IPv4, IPv6, or a Unix socket.
         * @property {string} [hostname] - The hostname or IP address of the remote client.
         * @property {number} [port] - The remote client's port number.
         * @default {{}}
         *
         * @example
         * ```typescript
         * ctx.req.remoteAddress
         * ```
         */
        this.remoteAddress = {};
        this.remoteAddress = remoteAddress;
        this.headers = new header_1.HeadersParser(req?.headers);
        this.method = req?.method?.toUpperCase();
        this.params = params;
        this.rawRequest = req;
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
        return await (0, formData_1.parseTextBody)(this.rawRequest);
    }
    /**
     * Parses the request body as JSON.
     * @returns {Promise<Record<string, any>>} The parsed JSON object.
     * If the Content-Type is not 'application/json', it returns an empty object.
     */
    async json() {
        const contentType = this.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await (0, formData_1.parseJsonBody)(this.rawRequest);
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
            return await (0, formData_1.parseJsonBody)(this.rawRequest);
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            return (0, formData_1.parseUrlEncodedBody)(this.rawRequest);
        }
        else if (contentType.includes("multipart/form-data")) {
            const boundary = contentType?.split("; ")?.[1]?.split("=")?.[1];
            if (!boundary) {
                throw Error("Boundary not found");
            }
            return await (0, formData_1.parseMultipartBody)(this.rawRequest, boundary, options);
        }
        else {
            return {};
        }
    }
}
exports.Request = Request;
