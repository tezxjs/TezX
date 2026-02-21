// src/core/request.ts
import { ExtractParamsFromPath, HTTPMethod, NetAddr, ReqHeaderKey, RequestHeaders } from "../types/index.js";
import { url2query } from "../utils/url.js";
/**
 * A wrapper around the raw HTTP request that provides convenient access to URL, headers, body parsing, and route parameters.
 *
 * @template Path - The route path string used to extract dynamic route parameters.
 */
export class TezXRequest<Path extends string = any> {
  /**
   * Full request URL including protocol and query string.
   * @type {string}
   */
  readonly url!: string;

  /**
   * HTTP request method (e.g., GET, POST, PUT, DELETE).
   * @type {HTTPMethod}
   */
  readonly method!: HTTPMethod;

  /**
   * Request path without query parameters.
   * @type {string}
   */
  public readonly pathname: string;

  /**
   * The original Request object from the underlying platform (e.g., Node.js).
   * Contains all headers and body data.
   * @type {Request}
   */
  readonly #rawRequest: Request;

  /**
   * Route parameters extracted from the path.
   * @type {ExtractParamsFromPath<Path>}
   */
  readonly params: ExtractParamsFromPath<Path> = {} as ExtractParamsFromPath<Path>;
  // Internal caches
  #bodyConsumed = false;
  #rawBodyArrayBuffer?: ArrayBuffer;
  #cachedText?: string;
  #cachedJSON?: any;
  #cachedFormObject?: FormData;
  #headersCache!: any;
  #queryCache!: any;

  /**
   * Creates an instance of TezXRequest.
   *
   * @param {Request} req - The raw Request object.
   * @param {string} method - The HTTP method.
   * @param {string} pathname - The request path without query parameters.
   * @param {ExtractParamsFromPath<Path>} params - Route parameters extracted from the path.
   */

  constructor(
    req: Request,
    method: string,
    pathname: string,
    params: ExtractParamsFromPath<Path>,
  ) {
    this.url = req.url;
    this.params = params ?? {};
    this.method = method as HTTPMethod;
    this.#rawRequest = req;
    this.pathname = pathname ?? "/";
  }

  /**
   * Gets a single header value by name, or all headers as an object if no name is provided.
   *
   * @param {ReqHeaderKey} [header] - The header name.
   * @returns {string | undefined | RequestHeaders} The header value or map of all headers.
   */
  public header(): RequestHeaders;
  public header(header: ReqHeaderKey): string | undefined;
  public header(header?: ReqHeaderKey): string | undefined | RequestHeaders {
    if (header) {
      return this.#rawRequest.headers.get(header.toLowerCase()) as | string | undefined;
    }
    if (this.#headersCache) return this.#headersCache;
    const obj: RequestHeaders = {}; // no prototype = safer/faster
    this.#rawRequest.headers.forEach((value, key) => {
      obj[key.toLowerCase()] = value;
    });

    this.#headersCache = obj;
    return this.#headersCache;
  }
  /**
   * Parses the query string from the URL into a key-value object.
   *
   * @returns {Record<string, any>} Query parameters.
   */
  get query(): Record<string, string | string[]> {
    return (this.#queryCache ??= url2query(this.url));
  }

  /**
   * Ensures the raw request body is buffered and stored internally.
   * Prevents multiple reads of the same stream.
   *
   * @private
   * @async
   * @returns {Promise<void>}
   */
  async #ensureRawBuffer(): Promise<void> {
    if (this.#bodyConsumed) return;
    // Note: cloning request if bodyUsed already true can be handled if needed.
    this.#rawBodyArrayBuffer = await this.#rawRequest.arrayBuffer();
    this.#bodyConsumed = true;
  }

  /**
   * Parses the request body as plain text.
   *
   * @returns {Promise<string>} The text content of the request body.
   */
  async text(): Promise<string> {
    if (this.#cachedText !== undefined) return this.#cachedText;
    await this.#ensureRawBuffer();
    this.#cachedText = new TextDecoder().decode(this.#rawBodyArrayBuffer);
    return this.#cachedText;
  }

  /**
   * Gets the content type of the request body.
   *
   * @private
   * @returns {string} Normalized content type (lowercase, no charset).
   */
  get #contentType(): string {
    const ct = this.#rawRequest.headers.get("content-type");
    if (!ct) return "";
    return ct.split(";")[0].trim().toLowerCase();
  }
  /**
   * Parses the request body as JSON.
   *
   * @template T - Expected type of parsed JSON object.
   * @returns {Promise<T>} Parsed JSON or empty object if not application/json.
   */
  async json<T extends Record<string, any>>(): Promise<T> {
    if (this.#cachedJSON !== undefined) return this.#cachedJSON;
    if (this.#contentType !== "application/json") return {} as T;
    try {
      // Prefer direct request.json() if not consumed yet for speed
      if (!this.#bodyConsumed) {
        this.#cachedJSON = await this.#rawRequest.json();
        this.#bodyConsumed = true;
      } else {
        const txt = await this.text();
        this.#cachedJSON = txt ? JSON.parse(txt) : {};
      }
    } catch {
      this.#cachedJSON = {};
    }
    return this.#cachedJSON;
  }

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
  async formData(): Promise<FormData> {
    if (this.#cachedFormObject) return this.#cachedFormObject;
    const ct = this.#contentType;
    if (!ct) throw new Error("Missing Content-Type");

    if (
      ct === "application/x-www-form-urlencoded" ||
      ct === "multipart/form-data"
    ) {
      if (this.#bodyConsumed) {
        throw new Error("Multipart body already consumed elsewhere");
      }
      this.#cachedFormObject = (await this.#rawRequest.formData()) as FormData;
      this.#bodyConsumed = true;
      return this.#cachedFormObject;
    }

    // Unsupported content types return empty FormData
    return this.#cachedFormObject as unknown as FormData;
  }
}
