import { ExtractParamsFromPath, HttpBaseResponse, ResHeaderKey, ResponseInit, WebSocketEvent } from "../types/index.js";
import { ContentType } from "../utils/mimeTypes.js";
import { TezXRequest } from "./request.js";
export declare class Context<TPath extends string = any> {
    #private;
    [key: string]: any;
    /**
     * Route parameters extracted from the path.
     * @type {ExtractParamsFromPath<TPath>}
     */
    readonly params: ExtractParamsFromPath<TPath>;
    /**
     * The raw `Request` object received from Bun's server.
     *
     * This represents the original Fetch API `Request`
     * before any parsing or modifications. Useful for
     * accessing headers, body, method, URL, etc.
     *
     * @type {Request}
     */
    rawRequest: Request;
    /**
     * The URL associated with the current context.
     *
     * This is a read-only string representing the resource location or endpoint.
     */
    readonly url: string;
    /**
     * The native Response object associated with this context, if available.
     *
     * This property is set when a response has been created or is being manipulated directly.
     * It may be undefined if the response has not yet been constructed.
     *
     * @type {Response | undefined}
     * @remarks
     * - When present, headers and status should be set directly on this object.
     * - When undefined, internal header and status management is used.
     */
    res?: Response;
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
    constructor(req: Request, pathname: string, method: string, server: Bun.Server<WebSocketEvent>);
    /**
     * Access the response headers.
     *
     * @remarks
     * This returns the native {@link Headers} object associated with the response.
     * It gives you full control over reading, setting, appending, and deleting headers
     * using the standard Web Headers API.
     *
     * @example
     * ```ts
     * // Get a header value
     * const contentType = ctx.headers.get("content-type")
     *
     * // Set or overwrite a header
     * ctx.headers.set("x-powered-by", "tezx")
     *
     * // Append multiple values
     * ctx.headers.append("set-cookie", "id=123")
     * ctx.headers.append("set-cookie", "token=xyz")
     *
     * // Iterate all headers
     * for (const [key, value] of ctx.headers.entries()) {
     *   console.log(key, value)
     * }
     * ```
     *
     * @returns {Headers} The response headers object.
     */
    get headers(): Headers;
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
    setHeader(key: ResHeaderKey, value: string, options?: {
        append?: boolean;
    }): this;
    /**
     * Gets the wrapped request object (`TezXRequest`).
     *
     * Lazily initializes the wrapped request on first access.
     *
     * @returns {TezXRequest<TPath>} The wrapped request.
     */
    get req(): TezXRequest<TPath>;
    /**
     * Sets the HTTP response status code.
     *
     * @param {number} status - HTTP status code to set (e.g., 200, 404).
     * @returns {this} The current context instance for method chaining.
     *
     * @example
     * ctx.status(404).text("Not found");
     */
    status(status: number): this;
    /**
     * Creates a native Response object with optional body, Content-Type, and headers.
     *
     * This function always overwrites the `Content-Type` header if `type` is provided.
     * It merges any existing headers from the context (`this.#headers`) with headers
     * provided in `init.headers`.
     *
     * @param {BodyInit | null} body - The response body. Can be string, Blob, ArrayBuffer, Uint8Array, or null.
     * @param {string | null} type - The MIME type to set in the `Content-Type` header. If null, no Content-Type is set.
     * @param {ResponseInit} [init={}] - Optional response initialization object (status, statusText, headers).
     * @param {number} [init.status] - HTTP status code (default is `this.#status`).
     * @param {string} [init.statusText] - Optional status text for the response.
     * @param {HeadersInit} [init.headers] - Additional headers to merge with context headers.
     *
     * @returns {Response} A native Fetch API Response object.
     *
     * @example
     * // Simple text response
     * const res = createResponse("Hello World", "text/plain");
     *
     * @example
     * // JSON response
     * const res = createResponse(JSON.stringify({ ok: true }), "application/json", { status: 200 });
     *
     * @example
     * // Custom headers
     * const res = createResponse("Hello", "text/plain", { headers: { "X-Custom": "test" } });
     */
    createResponse(body: BodyInit | null, type: ContentType | null, init?: ResponseInit): Response;
    /**
     * Protected helper method to create a Response or PlainResponse
     * based on runtime environment (Node.js or Web).
     *
     * @param {BodyInit | null} body - Response body content.
     * @param {ResponseInit} [init] - Response initialization options.
     * @returns {HttpBaseResponse} Response object suitable for runtime.
     * @protected
     */
    newResponse(body: BodyInit | null, init?: ResponseInit): Response;
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
     * @param {string} strings - The HTML string to return as the response body.
     * @param {ResponseInit} [init] - Optional response initialization settings (status, headers, etc.).
     *
     * @returns {HttpBaseResponse} The generated HTTP response with `text/html` content type.
     *
     * @example
     * return res.html("<h1>Hello World</h1>", { status: 200 });
     */
    html(strings: string, init?: ResponseInit): HttpBaseResponse;
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
    * Sends a file using Bun's streaming API.
    *
    * Behaviors:
    *  - If only `filePath` is provided → serves file normally.
    *  - If `filename` is provided → forces browser download.
    *  - If `download: true` is provided → forces download using original filename.
    *
    * Automatically sets:
    *  - Content-Type (based on extension)
    *  - Content-Length
    *
    * @param {string} filePath - Absolute path to the file.
    * @param {Object} [init] - Optional settings.
    * @param {boolean} [init.download] - Force download.
    * @param {string} [init.filename] - Optional download filename.
    * @param {ResponseInit["headers"]} [init.headers] - Additional headers.
    *
    * @returns {Promise<HttpBaseResponse>} Stream response.
    *
    * @throws {Error} If file does not exist.
    *
    * @example
    * await ctx.sendFile("/assets/logo.png");
    *
    * @example
    * await ctx.sendFile("/data/report.pdf", { download: true });
    *
    * @example
    * await ctx.sendFile("/data/report.pdf", { filename: "my-report.pdf" });
    */
    sendFile(filePath: string, init?: ResponseInit & {
        filename?: string;
        download?: boolean;
    }): Promise<HttpBaseResponse>;
    /**
     * Returns the underlying Bun server instance.
     *
     * This getter provides protected-level access to the
     * internal `Bun.Server` object, allowing subclasses to
     * extend or interact with low-level server behavior.
     *
     * @public
     * @returns {Bun.Server} The active Bun server instance.
     */
    get server(): Bun.Server<WebSocketEvent>;
}
