import { ExtractParamsFromPath, HttpBaseResponse, ResHeaderKey, ResponseInit } from "../types/index.js";
import { TezXRequest } from "./request.js";
export declare class Context<TEnv extends Record<string, any> = {}, TPath extends string = any> {
    #private;
    [key: string]: any;
    /**
     * Route parameters extracted from the path.
     * @type {ExtractParamsFromPath<TPath>}
     */
    readonly params: ExtractParamsFromPath<TPath>;
    /**
     * The original Request object from the underlying platform (e.g., Node.js, Deno).
     * Contains all headers and body data.
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
     * Environment variables or shared state accessible in context.
     * @type {Record<string, any> & TEnv}
     */
    env: Record<string, any> & TEnv;
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
     * @param {ContextOptions<TEnv>} options - Context options including pathname, method, env, params, and args.
     */
    constructor(req: Request, pathname: string, method: string, env: Record<string, any> & TEnv, args: any[]);
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
     * Supports both:
     * - Simple string: `ctx.html("<h1>Hello</h1>")`
     * - Template literal: `ctx.html`<h1>${title}</h1>``
     *
     * Minimizes intermediate string allocations for lower GC overhead.
     *
     * @param {string | readonly string[]} strings - HTML string or template literal array.
     * @param {...any[]} args - Values for template literals or a ResponseInit object if using a string.
     * @returns {HttpBaseResponse} Constructed HTML response.
     */
    html(strings: string, init?: ResponseInit): HttpBaseResponse;
    html(strings: readonly string[], ...values: any[]): HttpBaseResponse;
    /**
     * Sends an XML response.
     *
     * Supports both:
     * - Simple string: `ctx.xml("<note><to>User</to></note>")`
     * - Template literal: `ctx.xml`<note><to>${user}</to></note>``
     *
     * Minimizes intermediate string allocations for lower GC overhead.
     *
     * @param {string | readonly string[]} strings - XML string or template literal array.
     * @param {...any[]} args - Values for template literals or a ResponseInit object if using a string.
     * @returns {HttpBaseResponse} Constructed XML response.
     */
    xml(strings: string, init?: ResponseInit): HttpBaseResponse;
    xml(strings: readonly string[], ...values: any[]): HttpBaseResponse;
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
     *@property bun [server]
     *@property deno [connInfo]
     *@property node [res, server]
     */
    protected get args(): any;
}
