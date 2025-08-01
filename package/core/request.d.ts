import { ExtractParamsFromPath, HeaderKey, HTTPMethod, NetAddr, RequestHeaders } from "../types/index.js";
/**
 * A wrapper around the raw HTTP request that provides convenient access to URL, headers, body parsing, and route parameters.
 *
 * @template Path - The route path string used to extract dynamic route parameters.
 */
export declare class TezXRequest<Path extends string = any> {
    #private;
    /**
     * Full request URL including protocol and query string.
     * @type {string}
     */
    readonly url: string;
    /**
     * HTTP request method (e.g., GET, POST, PUT, DELETE).
     * @type {HTTPMethod}
     */
    readonly method: HTTPMethod;
    /**
     * Request path without query parameters.
     * @type {string}
     */
    readonly pathname: string;
    /**
     * Route parameters extracted from the path.
     * @type {ExtractParamsFromPath<Path>}
     */
    readonly params: ExtractParamsFromPath<Path>;
    /**
     * Remote address details of the connected client.
     * @requires injectRemoteAddress middleware.
     * @typedef {Object} NetAddr
     * @property {string} [transport] - Transport protocol (e.g., "tcp", "udp").
     * @property {"IPv4" | "IPv6" | "Unix"} [family] - Address family.
     * @property {string} [hostname] - Hostname or IP address.
     * @property {number} [port] - Port number.
     * @type {NetAddr}
     * @default {}
     */
    remoteAddress: NetAddr;
    /**
     * Creates an instance of TezXRequest.
     *
     * @param {Request} req - The raw Request object.
     * @param {string} method - The HTTP method.
     * @param {string} pathname - The request path without query parameters.
     * @param {ExtractParamsFromPath<Path>} params - Route parameters extracted from the path.
     */
    constructor(req: Request, method: string, pathname: string, params: ExtractParamsFromPath<Path>);
    /**
    * Gets a single header value by name, or all headers as an object if no name is provided.
    *
    * @param {HeaderKey} [header] - The header name.
    * @returns {string | undefined | RequestHeaders} The header value or map of all headers.
    */
    header(): RequestHeaders;
    header(header: HeaderKey): string | undefined;
    /**
     * Parses the query string from the URL into a key-value object.
     *
     * @returns {Record<string, any>} Query parameters.
     */
    get query(): Record<string, any>;
    /**
    * Parses the request body as plain text.
    *
    * @returns {Promise<string>} The text content of the request body.
    */
    text(): Promise<string>;
    /**
     * Parses the request body as JSON.
     *
     * @template T - Expected type of parsed JSON object.
     * @returns {Promise<T | {}>} Parsed JSON or empty object if not application/json.
     */
    json<T = any>(): Promise<T | {}>;
    /**
     * Parses and returns the form data from the incoming HTTP request.
     *
     * ✅ Supports:
     * - `application/x-www-form-urlencoded`
     * - `multipart/form-data`
     *
     * ⚠️ Throws:
     * - If the `Content-Type` header is missing.
     * - If the body has already been read/consumed elsewhere.
     *
     * 🧠 Internally caches the parsed `FormData` to prevent multiple reads.
     *
     * @returns {Promise<FormData>}
     * A promise that resolves to a native `FormData` object.
     *
     * @throws {Error} If the content type is missing or the request body has already been consumed.
     */
    formData(): Promise<FormData>;
}
