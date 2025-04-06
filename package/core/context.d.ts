import { HeadersParser } from "./header";
import { ConnAddress, HTTPMethod, Request } from "./request";
import { State } from "../utils/state";
export interface CookieOptions {
  expires?: Date;
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}
export declare const httpStatusMap: Record<number, string>;
export type ResponseHeaders = Record<string, string>;
export declare class Context<T extends Record<string, any> = {}> {
  #private;
  [key: string]: any;
  /**
   * Environment variables and configuration
   * @type {object}
   */
  env: Record<string, any> & T;
  /**
   * Parser for handling and manipulating HTTP headers
   * @type {HeadersParser}
   */
  headers: HeadersParser;
  /**
   * Parser for handling and manipulating HTTP response(Read Only)
   * @type {Response}
   */
  readonly res: Response | undefined;
  /**
   * Request path without query parameters
   * @type {string}
   */
  readonly pathname: string;
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
   * Public state container for application data
   * state storage for middleware and plugins
   * @type {State}
   */
  state: State;
  constructor(req: any, connInfo: ConnAddress);
  /**
   * Cookie handling utility with get/set/delete operations
   * @returns {{
   *  get: (name: string) => string | undefined,
   *  all: () => Record<string, string>,
   *  delete: (name: string, options?: CookieOptions) => void,
   *  set: (name: string, value: string, options?: CookieOptions) => void
   * }} Cookie handling interface
   */
  /**
   * Sets a header value.
   * @param key - Header name.
   * @param value - Header value(s).
   */
  header(key: string, value: string | string[]): this;
  get cookies(): {
    /**
     * Get a specific cookie by name.
     * @param {string} cookie - The name of the cookie to retrieve.
     * @returns {string | undefined} - The cookie value or undefined if not found.
     */
    get: (cookie: string) => string;
    /**
     * Get all cookies as an object.
     * @returns {Record<string, string>} - An object containing all cookies.
     */
    all: () => Record<string, string>;
    /**
     * Delete a cookie by setting its expiration to the past.
     * @param {string} name - The name of the cookie to delete.
     * @param {CookieOptions} [options] - Additional cookie options.
     */
    delete: (name: string, options?: CookieOptions) => void;
    /**
     * Set a new cookie with the given name, value, and options.
     * @param {string} name - The name of the cookie.
     * @param {string} value - The value of the cookie.
     * @param {CookieOptions} [options] - Additional options like expiration.
     */
    set: (name: string, value: string, options?: CookieOptions) => void;
  };
  /**
   * Sends a JSON response.
   * @param body - The response data.
   * @param status - (Optional) HTTP status code (default: 200).
   * @param headers - (Optional) Additional response headers.
   * @returns Response object with JSON data.
   */
  json(body: any, status?: number, headers?: ResponseHeaders): Response;
  json(body: any, headers?: ResponseHeaders): Response;
  json(body: any, status?: number): Response;
  /**
   * Sends a response with any content type.
   * Automatically determines content type if not provided.
   * @param body - The response body.
   * @param status - (Optional) HTTP status code.
   * @param headers - (Optional) Additional response headers.
   * @returns Response object.
   */
  send(body: any, status?: number, headers?: ResponseHeaders): any;
  send(body: any, headers?: ResponseHeaders): any;
  send(body: any, status?: number): any;
  /**
   * Sends an HTML response.
   * @param data - The HTML content as a string.
   * @param status - (Optional) HTTP status code (default: 200).
   * @param headers - (Optional) Additional response headers.
   * @returns Response object with HTML data.
   */
  html(data: string, status?: number, headers?: ResponseHeaders): any;
  html(data: string, headers?: ResponseHeaders): any;
  html(data: string, status?: number): any;
  /**
   * Sends a plain text response.
   * @param data - The text content.
   * @param status - (Optional) HTTP status code (default: 200).
   * @param headers - (Optional) Additional response headers.
   * @returns Response object with plain text data.
   */
  text(data: string, status?: number, headers?: ResponseHeaders): any;
  text(data: string, headers?: ResponseHeaders): any;
  text(data: string, status?: number): any;
  /**
   * Sends an XML response.
   * @param data - The XML content.
   * @param status - (Optional) HTTP status code (default: 200).
   * @param headers - (Optional) Additional response headers.
   * @returns Response object with XML data.
   */
  xml(data: string, status?: number, headers?: ResponseHeaders): any;
  xml(data: string, headers?: ResponseHeaders): any;
  xml(data: string, status?: number): any;
  /**
   * HTTP status code..
   * @param status - number.
   * @returns Response object with context all method.
   */
  status: (status: number) => this;
  set setStatus(status: number);
  get getStatus(): number;
  /**
   * Redirects to a given URL.
   * @param url - The target URL.
   * @param status - (Optional) HTTP status code (default: 302).
   * @returns Response object with redirect.
   */
  redirect(url: string, status?: number): Response;
  /**
   * Handles file downloads.
   * @param filePath - The path to the file.
   * @param fileName - The name of the downloaded file.
   * @returns Response object for file download.
   */
  download(filePath: string, fileName: string): Promise<Response>;
  /**
   * Serves a file to the client.
   * @param filePath - Absolute or relative path to the file.
   * @param fileName - (Optional) The name of the send file.
   * @param headers - (Optional) Additional headers.
   * @returns Response object with the file stream.
   */
  sendFile(
    filePath: string,
    fileName?: string,
    headers?: ResponseHeaders,
  ): Promise<Response>;
  sendFile(filePath: string, headers?: ResponseHeaders): Promise<Response>;
  sendFile(filePath: string, fileName?: string): Promise<Response>;
  /**
   * Getter that creates a standardized Request object from internal state
   * @returns {Request} - Normalized request object combining:
   * - Raw platform-specific request
   * - Parsed headers
   * - Route parameters
   *
   * @example
   * // Get standardized request
   * const request = ctx.req;
   * // Access route params
   * const id = request.params.get('id');
   */
  get req(): Request;
  protected set params(params: Record<string, any>);
  protected get params(): Record<string, any>;
}
