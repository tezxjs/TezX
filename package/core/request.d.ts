import { ExtractParamsFromPath, FormDataOptions, HTTPMethod, NetAddr, PathType } from "../types/index.js";
import type { UrlRef } from "../utils/url.js";
import { TezXServeOptions } from "./server.js";
export declare class Request<Path extends PathType = any> {
    /**
     * Full request URL including protocol and query string
     * @type {string}
     */
    readonly url: string;
    /**
     * HTTP request method (GET, POST, PUT, DELETE, etc.)
     * @type {HTTPMethod}
     */
    readonly method: HTTPMethod;
    /**
     * Request path without query parameters
     * @type {string}
     */
    readonly pathname: string;
    /** Parsed URL reference containing components like query parameters, pathname, etc. */
    readonly urlRef: UrlRef;
    /** Query parameters extracted from the URL */
    readonly query: Record<string, any>;
    protected rawRequest: any;
    /**
     * Retrieve a parameter by name.
     * @param name - The parameter name.
     * @returns The parameter value if found, or undefined.
     */
    readonly params: ExtractParamsFromPath<Path>;
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
    remoteAddress: NetAddr;
    constructor({ params, method, req, options, }: {
        method: string;
        req: any;
        params: Record<string, any>;
        options: TezXServeOptions;
    });
    get headers(): {
        /**
         * Retrieves the first value of a specific header.
         * @param key - Header name to search for.
         * @returns The first header value or null if not found.
         * @example
         * get('content-type') // returns 'application/json'
         */
        get: (key: string) => string | null;
        /**
         * Checks if a header exists in the request.
         * @param key - Header name to check for existence.
         * @returns True if the header exists, false otherwise.
         * @example
         * has('Authorization') // returns true if 'Authorization' header exists
         */
        has: (key: string) => boolean;
        /**
         * Returns an iterator over all header entries.
         * Each entry is a [key, value] pair where the value can be an array of strings.
         * @returns HeadersIterator for iterating over header key-value pairs.
         * @example
         * for (let [key, value] of headers.entries()) {
         *   console.log(key, value);
         * }
         */
        entries: () => HeadersIterator<[string, string]>;
        /**
         * Returns an iterator over all header keys.
         * This allows iteration over the names of all headers in the request.
         * @returns HeadersIterator of header names.
         * @example
         * for (let key of headers.keys()) {
         *   console.log(key);
         * }
         */
        keys: () => HeadersIterator<string>;
        /**
         * Returns an iterator over all header values.
         * This allows iteration over the values of all headers, with each value being an array of strings.
         * @returns HeadersIterator<string> of header values.
         * @example
         * for (let value of headers.values()) {
         *   console.log(value);
         * }
         */
        values: () => HeadersIterator<string>;
        /**
         * Iterates over each header and executes a callback for every header found.
         * @param callback - Function to execute for each header. Receives the value array and key.
         * @example
         * headers.forEach((key, value) => {
         *   console.log(key, value);
         * });
         */
        forEach: (callbackfn: (value: string, key: string, parent: Headers) => void) => void;
        /**
         * Converts headers to a JSON-safe plain object (only single string values).
         * Multi-value headers are joined by commas.
         * @returns A record of headers with string values.
         */
        toJSON(): Record<string, string>;
    };
    /**
     * Parses the request body as plain text.
     * @returns {Promise<string>} The text content of the request body.
     */
    text(): Promise<any>;
    /**
     * Parses the request body as JSON.
     * @returns {Promise<Record<string, any>>} The parsed JSON object.
     * If the Content-Type is not 'application/json', it returns an empty object.
     */
    json(): Promise<any>;
    /**
     * Parses the request body based on Content-Type.
     * Supports:
     * - application/json → JSON parsing
     * - application/x-www-form-urlencoded → URL-encoded form parsing
     * - multipart/form-data → Multipart form-data parsing (for file uploads)
     * @returns {Promise<Record<string, any>>} The parsed form data as an object.
     * @throws {Error} If the Content-Type is missing or invalid.
     */
    formData(options?: FormDataOptions): Promise<Record<string, any>>;
}
