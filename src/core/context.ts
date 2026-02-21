// src/core/context.ts
import { ExtractParamsFromPath, HttpBaseResponse, ResHeaderKey, ResponseHeaders, ResponseInit, WebSocketEvent } from "../types/index.js";
import { ContentType, defaultMimeType } from "../utils/mimeTypes.js";
import { mergeHeaders } from "../utils/response.js";
import { TezXRequest } from "./request.js";

export class Context<TPath extends string = any> {
  [key: string]: any;

  #status: number = 200;
  #headers?: Headers;
  /**
   * Wrapped request instance (TezXRequest).
   * Lazily initialized on first access.
   * @private
   * @type {TezXRequest<TPath> | null}
   */
  #req: TezXRequest<TPath> | null = null;
  /**
   * Route parameters extracted from the path.
   * @type {ExtractParamsFromPath<TPath>}
   */
  readonly params: ExtractParamsFromPath<TPath> = {} as ExtractParamsFromPath<TPath>;

  /**
   * The raw `Request` object received from Bun's server.
   * 
   * This represents the original Fetch API `Request`
   * before any parsing or modifications. Useful for
   * accessing headers, body, method, URL, etc.
   *
   * @type {Request}
   */
  rawRequest!: Request;

  /**
   * Internal Bun server instance used to manage low-level
   * server behavior, configurations, and request handling.
   *
   * This is a **private class field** (with `#`) and should
   * not be accessed from outside the class.
   *
   * @type {Bun.Server}
   * @private
   */
  #server: Bun.Server<WebSocketEvent>;

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
  public readonly pathname: string;
  /**
   * HTTP request method (e.g., GET, POST).
   * @readonly
   * @type {string}
   */
  public readonly method: string;
  constructor(req: Request, pathname: string, method: string, server: Bun.Server<WebSocketEvent>) {
    this.#server = server;
    this.rawRequest = req;
    this.url = req.url;
    this.pathname = pathname;
    this.method = method;
  }

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
  public get headers(): Headers {
    return this.res?.headers ?? (this.#headers ??= new Headers());
  }
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
  setHeader(
    key: ResHeaderKey,
    value: string,
    options?: { append?: boolean },
  ): this {
    if (!value) return this;

    const _key = key.toLowerCase();
    const append = options?.append || _key === "set-cookie";
    const target = this.headers; // Use getter for consistency

    if (append) {
      target.append(_key, value);
    } else {
      target.set(_key, value);
    }
    return this;
  }

  /**
   * Gets the wrapped request object (`TezXRequest`).
   *
   * Lazily initializes the wrapped request on first access.
   *
   * @returns {TezXRequest<TPath>} The wrapped request.
   */
  public get req(): TezXRequest<TPath> {
    return (this.#req ??= new TezXRequest<TPath>(this.rawRequest, this.method, this.pathname, this.params as any));
  }

  /**
   * Sets the HTTP response status code.
   *
   * @param {number} status - HTTP status code to set (e.g., 200, 404).
   * @returns {this} The current context instance for method chaining.
   *
   * @example
   * ctx.status(404).text("Not found");
   */
  public status(status: number): this {
    this.#status = status;
    return this;
  }
  // ! *************************************** RESPONSE ***************************************
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
  createResponse(body: BodyInit | null, type: ContentType | null, init: ResponseInit = {}): Response {
    const headers = mergeHeaders(this.#headers, init.headers);
    // overwrite type
    if (type) {
      headers.set("Content-Type", type);
    }
    return new Response(body, {
      status: init.status ?? this.#status,
      statusText: init.statusText,
      headers,
    });
  }

  /**
   * Protected helper method to create a Response or PlainResponse
   * based on runtime environment (Node.js or Web).
   *
   * @param {BodyInit | null} body - Response body content.
   * @param {ResponseInit} [init] - Response initialization options.
   * @returns {HttpBaseResponse} Response object suitable for runtime.
   * @protected
   */
  newResponse(body: BodyInit | null, init: ResponseInit = {}): Response {
    return this.createResponse(body, null, init)
  }

  /**
   * Sends a plain text response.
   *
   * Automatically sets Content-Type to `text/plain; charset=utf-8`.
   *
   * @param {string} content - The plain text content.
   * @param {ResponseInit} [init] - Optional response init.
   * @returns {HttpBaseResponse} The response object.
   */
  public text(content: string, init?: ResponseInit): HttpBaseResponse {
    return this.createResponse(content, "text/plain; charset=utf-8", init);
  }

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
  public html(strings: string, init?: ResponseInit): HttpBaseResponse {
    return this.createResponse(
      strings,
      "text/html; charset=utf-8",
      init
    );
  }

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
  public json(json: object, init?: ResponseInit): HttpBaseResponse {
    return this.createResponse(
      JSON.stringify(json),
      "application/json; charset=utf-8",
      init,
    );
  }

  // /**
  // * Send a response with automatic content type detection.
  // *
  // * This method determines the proper `Content-Type` header based on the type of `body`.
  // * If a `Content-Type` is provided in `init.headers`, it will be used instead.
  // *
  // * Supported types:
  // * - `string` / `number` → "text/plain"
  // * - `object` → JSON serialized, "application/json"
  // * - `Uint8Array` / `ArrayBuffer` / `ReadableStream` → "application/octet-stream"
  // * - `Blob` / `File` → uses `body.type` or falls back to "application/octet-stream"
  // * - `null` / `undefined` → empty string, "text/plain"
  // * - any other → `String(body)`, "text/plain"
  // *
  // * @param {any} body - Response body of any type.
  // * @param {ResponseInit} [init] - Optional response init object, headers, status, etc.
  // * @returns {HttpBaseResponse} - A Bun-compatible response object.
  // *
  // * @example
  // * // Send a string
  // * ctx.send("Hello World");
  // *
  // * // Send JSON
  // * ctx.send({ user: "Alice", id: 123 });
  // *
  // * // Send binary
  // * ctx.send(new Uint8Array([1,2,3]));
  // *
  // * // Custom content-type
  // * ctx.send("Hello", { headers: { "Content-Type": "text/html" } });
  // */
  // public send(body: any, init?: ResponseInit): HttpBaseResponse {
  //   let _body: any;
  //   let type: string;

  //   // Determine body type
  //   if (body === null || body === undefined) {
  //     _body = "";
  //     type = "text/plain";
  //   } else if (typeof body === "string" || typeof body === "number") {
  //     _body = body;
  //     type = "text/plain";
  //   }
  //   else if (body instanceof Uint8Array || body instanceof ArrayBuffer || (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)) {
  //     _body = body;
  //     type = "application/octet-stream";
  //   }
  //   else if (body instanceof Blob || (typeof File !== "undefined" && body instanceof File)) {
  //     _body = body;
  //     type = body.type || "application/octet-stream";
  //   }
  //   else if (typeof body === "object") {
  //     _body = JSON.stringify(body);
  //     type = "application/json";
  //   }
  //   else {
  //     _body = String(body);
  //     type = "text/plain";
  //   }
  //   return this.createResponse(_body, type, init);
  // }

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
  public redirect(url: string, status: number = 302): Response {
    const headers = new Headers(this.#headers);
    headers.set("Location", url);
    return new Response(null, { status, headers });
  }

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
  public async sendFile(filePath: string, init?: ResponseInit & { filename?: string; download?: boolean }): Promise<HttpBaseResponse> {
    let file = Bun.file(filePath);
    if (!await file.exists()) {
      this.#status = 404;
      throw Error("File not found")
    };
    let size = file.size;
    let stream = file.stream();
    let headers: ResponseHeaders = init?.headers ?? {}
    headers['Content-Length'] = size.toString();

    if (init?.filename) {
      headers["Content-Disposition"] = `attachment; filename="${init?.filename}"`;
    }

    return this.createResponse(stream as any, (init?.download || init?.filename) ? "application/octet-stream" : file?.type ?? defaultMimeType, {
      status: init?.status ?? this.#status,
      statusText: init?.statusText,
      headers,
    });
  }
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
  public get server(): Bun.Server<WebSocketEvent> {
    return this.#server;
  }
}
