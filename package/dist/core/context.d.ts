import { HeaderKey, HttpBaseResponse, ResponseHeaders, ResponseInit } from "../types/index.js";
import { TezXRequest } from "./request.js";
export type ContextOptions<T> = {
    pathname: string;
    method: string;
    env: Record<string, any> & T;
    args?: any[];
};
/**
 * Represents the context of an HTTP request lifecycle.
 * Provides utilities to handle request, response, headers, and body.
 *
 * @template T - The type for environment variables or shared state.
 * @template Path - The string literal type for route paths.
 */
export declare class Context<T extends Record<string, any> = {}, Path extends string = any> {
    #private;
    [key: string]: any;
    /**
     * The original Request object from the underlying platform (e.g., Node.js, Deno).
     * Contains all headers and body data.
     * @type {Request}
     */
    rawRequest: Request;
    /**
     * Environment variables or shared state accessible in context.
     * @type {Record<string, any> & T}
     */
    env: Record<string, any> & T;
    /**
     * Request pathname (URL path without domain).
     * @readonly
     * @type {string}
     */
    readonly pathname: string;
    /**
     * HTTP request method (e.g., GET, POST).
     * @readonly
     * @type {string}
     */
    readonly method: string;
    /**
     * Creates a new context instance.
     *
     * @param {Request} req - The native Request object.
     * @param {ContextOptions<T>} options - Context options including pathname, method, env, params, and args.
     */
    constructor(req: Request, options: ContextOptions<T>);
    /**
    * Returns the full URL string of the request, including query parameters.
    * @type {string}
    */
    get url(): string;
    /**
     * Gets the current HTTP status code.
     * @returns {number} The HTTP status code.
     */
    get getStatus(): number;
    /**
     * Sets the HTTP status code.
     * @param {number} code - The HTTP status code.
     */
    set setStatus(code: number);
    /**
     * Retrieves a specific header value or all headers.
     *
     * @param {HeaderKey} [header] - Optional header name (case-insensitive, internally lowercased).
     * @returns {string | undefined | ResponseHeaders} - Returns the header value if key is provided,
     * or the entire headers object if no key is passed.
     *
     * @example
     * ctx.header('content-type'); // → 'application/json'
     * ctx.header(); // → { 'content-type': 'application/json' }
     */
    header(): ResponseHeaders;
    header(header: HeaderKey): string | undefined;
    /**
    * Sets or appends a header to the response.
    *
    * @param {string} key - Header name (e.g., "Content-Type").
    * @param {string} value - Header value to set or append.
    * @param {Object} [options] - Options to modify behavior.
    * @param {boolean} [options.append=false] - If true, appends instead of overwriting.
    * @returns {this} The context instance for chaining.
    *
    * @example
    * ctx.setHeader("X-Custom", "Value");
    * ctx.setHeader("Cache-Control", "no-cache", { append: true });
    */
    setHeader(key: string, value: string, options?: {
        append?: boolean;
    }): this;
    /**
    * Gets the route parameters extracted from the URL.
    *
    * @returns {Record<string, any>} An object containing key-value pairs of route parameters.
    *
    * @example
    * // For route `/user/:id` and URL `/user/123`, it returns: { id: "123" }
    */
    get params(): Record<string, any>;
    protected set params(params: Record<string, any>);
    /**
    * Gets the wrapped request object (`TezXRequest`).
    *
    * Lazily initializes the wrapped request on first access.
    *
    * @returns {TezXRequest<Path>} The wrapped request.
    */
    get req(): TezXRequest<Path>;
    /**
    * Gets the response body.
    * @returns {*} The response body.
    */
    get body(): any;
    /**
    * Sets the response body.
    * @param {*} value - The response body.
    */
    set body(value: any);
    /**
    * Sets the HTTP response status code.
    *
    * @param {number} status - HTTP status code to set (e.g., 200, 404).
    * @returns {this} The current context instance for method chaining.
    *
    * @example
    * ctx.status(404).text("Not found");
    */
    status: (status: number) => this;
    /**
     * Protected helper method to create a Response or PlainResponse
     * based on runtime environment (Node.js or Web).
     *
     * @param {BodyInit | null} body - Response body content.
     * @param {ResponseInit} [init] - Response initialization options.
     * @returns {HttpBaseResponse} Response object suitable for runtime.
     * @protected
     */
    createResponse(body: BodyInit | null, init?: ResponseInit): HttpBaseResponse;
    /**
    * Sends a plain text response.
    *
    * Automatically sets Content-Type to `text/plain; charset=utf-8`.
    *
    * @param {string} content - The plain text content.
    * @param {ResponseInit} [init] - Optional response init.
    * @returns {HttpBaseResponse} The response object.
    */
    text(content: string, init?: ResponseInit): HttpBaseResponse;
    /**
     * Sends an HTML response.
     *
     * Can be used as a template literal or simple HTML string.
     *
     * @param {string | readonly string[]} strings - HTML string or template literals.
     * @param {...any[]} [args] - Optional values for template literals or ResponseInit.
     * @returns {HttpBaseResponse} A properly constructed HTML response.
     *
     * @example
     * ctx.html("<h1>Hello</h1>");
     * ctx.html`<h1>${title}</h1>`;
     */
    html(strings: string, init?: ResponseInit): HttpBaseResponse;
    html(strings: readonly string[], ...values: any[]): HttpBaseResponse;
    /**
     * Sends an XML response.
     *
     * Automatically sets Content-Type to `application/xml; charset=utf-8`.
     *
     * @param {string} xml - XML string.
     * @param {ResponseInit} [init] - Optional response init.
     * @returns {HttpBaseResponse} The response object.
     */
    xml(xml: string, init?: ResponseInit): HttpBaseResponse;
    /**
     * Sends a JSON response.
     *
     * Automatically sets Content-Type to `application/json; charset=utf-8`.
     *
     * @param {object} json - JSON-serializable object.
     * @param {ResponseInit} [init] - Optional response init overrides.
     * @returns {HttpBaseResponse} A JSON response object.
     *
     * @example
     * ctx.json({ success: true });
     */
    json(json: object, init?: ResponseInit): HttpBaseResponse;
    /**
     * Sends a response with automatic content type detection.
     *
     * Uses `determineContentTypeBody` utility to infer Content-Type.
     *
     * @param {*} body - Response body.
     * @param {ResponseInit} [init] - Optional response init.
     * @returns {HttpBaseResponse} The response object.
     */
    send(body: any, init?: ResponseInit): HttpBaseResponse;
    /**
     * Sends an HTTP redirect response to the specified URL.
     *
     * @param {string} url - Target URL to redirect to.
     * @param {number} [status=302] - Redirect HTTP status code.
     * @returns {Response} A native redirect response.
     *
     * @example
     * ctx.redirect("/login", 301);
     */
    redirect(url: string, status?: number): Response;
    /**
     * Sends a file as a downloadable response.
     *
     * @param {string} filePath - Absolute file path on the server.
     * @param {string} filename - Filename to present to the client.
     * @returns {Promise<HttpBaseResponse>} Response that triggers download.
     *
     * @throws {Error} If file is not found.
     *
     * @example
     * await ctx.download("/files/report.pdf", "report.pdf");
     */
    download(filePath: string, filename: string): Promise<HttpBaseResponse>;
    /**
     * Sends a file as a stream response.
     *
     * Automatically sets appropriate `Content-Type` and `Content-Length`.
     * Adds `Content-Disposition` if filename is provided.
     *
     * @param {string} filePath - Absolute path to the file.
     * @param {Object} [init] - Response options and optional download filename.
     * @param {string} [init.filename] - Name to suggest for download.
     * @returns {Promise<HttpBaseResponse>} A streamable file response.
     *
     * @throws {Error} If the file does not exist.
     *
     * @example
     * await ctx.sendFile("/path/to/image.png");
     */
    sendFile(filePath: string, init?: ResponseInit & {
        filename?: string;
    }): Promise<HttpBaseResponse>;
    /**
     * bun [server]
     * deno [connInfo]
     * node [res, server]
     */
    protected get args(): any;
}
