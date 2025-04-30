import { UrlRef } from "../utils/url.js";
import { HeadersParser } from "./header.js";
import { TezXServeOptions } from "./server.js";
export type FormDataOptions = {
    maxSize?: number;
    allowedTypes?: string[];
    sanitized?: boolean;
    maxFiles?: number;
};
type TransportType = "tcp" | "udp" | "unix" | "pipe" | "unixpacket";
export type NetAddr = {
    transport?: TransportType;
    family?: "IPv4" | "IPv6" | "Unix";
    address?: string;
    port?: number;
};
export type ConnAddress = {
    remoteAddr: NetAddr;
    localAddr: NetAddr;
};
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "ALL" | "TRACE" | "CONNECT" | string;
export declare class Request {
    #private;
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
    readonly params: Record<string, any>;
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
    constructor({ headers, params, req, options, urlRef, }: {
        req: any;
        params: Record<string, any>;
        headers: HeadersParser;
        urlRef: UrlRef;
        options: TezXServeOptions;
    });
    get headers(): {
        /**
         * Retrieves the first value of a specific header.
         * @param key - Header name to search for.
         * @returns The first header value or undefined if not found.
         * @example
         * get('content-type') // returns 'application/json'
         */
        get: (key: string) => string | undefined;
        /**
         * Retrieves all values of a specific header.
         * If multiple values exist for a header, all will be returned as an array.
         * @param key - Header name to search for.
         * @returns An array of all header values associated with the key.
         * @example
         * getAll('accept-language') // returns ['en-US', 'fr-CA']
         */
        getAll: (key: string) => string | never[];
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
         * @returns IterableIterator for iterating over header key-value pairs.
         * @example
         * for (let [key, value] of headers.entries()) {
         *   console.log(key, value);
         * }
         */
        entries: () => IterableIterator<[string, string[]]>;
        /**
         * Returns an iterator over all header keys.
         * This allows iteration over the names of all headers in the request.
         * @returns IterableIterator of header names.
         * @example
         * for (let key of headers.keys()) {
         *   console.log(key);
         * }
         */
        keys: () => IterableIterator<string>;
        /**
         * Returns an iterator over all header values.
         * This allows iteration over the values of all headers, with each value being an array of strings.
         * @returns IterableIterator of header values.
         * @example
         * for (let value of headers.values()) {
         *   console.log(value);
         * }
         */
        values: () => IterableIterator<string[]>;
        /**
         * Iterates over each header and executes a callback for every header found.
         * @param callback - Function to execute for each header. Receives the value array and key.
         * @example
         * headers.forEach((key, value) => {
         *   console.log(key, value);
         * });
         */
        forEach: (callback: (value: string[], key: string) => void) => void;
        /**
         * Converts all headers into a plain JavaScript object.
         * Single-value headers are represented as a string, and multi-value headers as an array.
         * @returns A plain object with header names as keys and their values as strings or arrays.
         * @example
         * const headersObject = headers.toObject();
         * console.log(headersObject);
         */
        toObject: () => Record<string, string | string[]>;
    };
    /**
     * Parses the request body as plain text.
     * @returns {Promise<string>} The text content of the request body.
     */
    text(): Promise<string>;
    /**
     * Parses the request body as JSON.
     * @returns {Promise<Record<string, any>>} The parsed JSON object.
     * If the Content-Type is not 'application/json', it returns an empty object.
     */
    json(): Promise<Record<string, any>>;
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
export {};
