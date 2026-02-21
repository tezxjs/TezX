// ! *********************** websocket ********************************

/**
 * Type definition for WebSocket event handlers.
 * @template T - The type of data expected by the handler
 * @param {WebSocket} ws - The WebSocket instance
 * @param {T} [data] - Optional data associated with the event
 * @returns {Promise<void> | void}
 */
type WebSocketHandler<T = any> = (ws: WebSocket, data?: T) => Promise<void> | void;

/**
 * Defines all supported WebSocket event handlers.
 */
export type WebSocketEvent = {
  /**
   * Triggered when the WebSocket connection is successfully opened.(make sure it support in node)
   */
  open?: WebSocketHandler;

  /**
   * Triggered when a message is received from the client.
   * Supports `string`, `Buffer`, or `ArrayBuffer` payloads.
   */
  message?: WebSocketHandler<string | Buffer | ArrayBuffer>;

  /**
   * Triggered when the WebSocket connection is closed.
   * Provides the close code and reason.
   */
  close?: WebSocketHandler<{ code: number; reason: string }>;

  /**
   * Triggered when the socket drain event occurs.
   */
  drain?: WebSocketHandler;

  /**
   * Triggered when a ping frame is received from the client.
   */
  ping?: WebSocketHandler<Buffer>;

  /**
   * Triggered when a pong frame is received from the client.
   */
  pong?: WebSocketHandler<Buffer>;
};

/**
 * Callback function that returns WebSocket event handlers based on context.
 * @param {Context} ctx - The request context
 * @returns {WebSocketEvent} - Object containing WebSocket event handlers
 */
export type WebSocketCallback = (ctx: Context) => WebSocketEvent;

/**
 * Dynamic options for configuring WebSocket behavior across different runtimes.
 */
export type WebSocketOptions = {
  /**
   * Called when an error occurs during the upgrade process.
   */
  onUpgradeError?: (err: Error, ctx: Context) => HttpBaseResponse;
};

// ! *********************** core/context.js ********************************

/**
 * Represents a string key used for HTTP headers.
 */
export type ReqHeaderKey = RequestHeader | (string & {});

/**
 * Represents a string key used for HTTP headers.
 */
export type ResHeaderKey = ResponseHeader | (string & {});

/**
 * Represents a collection of HTTP response headers as key-value pairs.
 * Keys and values are strings.
 */
export interface ResponseHeaders extends Partial<Record<ResHeaderKey, string>> {
  [key: string]: string | undefined;
}

/**
 * Represents a collection of HTTP request headers as key-value pairs.
 * Keys and values are strings.
 */
export interface RequestHeaders extends Partial<Record<ReqHeaderKey, string>> {
  [key: string]: string | undefined;
}

/**
 * Options for initializing a Response object.
 */
export interface ResponseInit {
  /**
   * HTTP status code, e.g. 200, 404, 500.
   * Optional; defaults to 200 if not specified.
   */
  status?: number;

  /**
   * Optional HTTP status text corresponding to the status code,
   * e.g., "OK", "Not Found".
   */
  statusText?: string;

  /**
   * Additional HTTP response headers to include in the response.
   */
  headers?: ResponseHeaders;
}

/**
 * Options for setting HTTP cookies.
 */
export interface CookieOptions {
  /** Expiration date of the cookie. */
  expires?: Date;

  /** URL path the cookie is valid for. */
  path?: string;

  /** Max age of the cookie in seconds. */
  maxAge?: number;

  /** Domain the cookie is valid for. */
  domain?: string;

  /** Whether the cookie is only sent over HTTPS. */
  secure?: boolean;

  /** Whether the cookie is inaccessible to JavaScript's `Document.cookie` API. */
  httpOnly?: boolean;

  /** Controls cross-site request behavior. One of "Strict", "Lax", or "None". */
  sameSite?: "Strict" | "Lax" | "None";
}

import { BaseContext, Context } from "../index.js";
import { RequestHeader, ResponseHeader } from "./headers.js";

/**
 * Options to customize static file serving behavior.
 */
/**
 * Options for serving static files with a router or server.
 *
 * Use these options to control caching, headers, allowed extensions,
 * and ETag behavior when serving static assets.
 */
export type StaticServeOption = {
  /**
   * Optional `Cache-Control` header value for static files.
   *
   * Example: `"max-age=3600"` to cache files for 1 hour.
   * If not provided, default cache control behavior of the server applies.
   */
  cacheControl?: string;

  /**
   * Additional HTTP headers to set on static file responses.
   *
   * Can be used to set headers like `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
   *
   * Example:
   * ```ts
   * headers: {
   *   "X-Content-Type-Options": "nosniff",
   *   "X-Frame-Options": "DENY"
   * }
   * ```
   */
  headers?: ResponseHeaders;

  /**
   * Allowed file extensions to serve.
   *
   * If provided, only files with these extensions will be served.
   * Prevents serving unwanted files from the static directory.
   *
   * Example:
   * ```ts
   * extensions: ["html", "css", "js", "png", "jpg"]
   * ```
   */
  extensions?: string[];

  /**
   * Set whether ETag should be strong or weak.
   *
   * - `true`: strong ETag (default)
   * - `false`: weak ETag
   *
   * Strong ETag uses the full content hash of the file, weak ETag uses a simpler hash
   * that may tolerate minor changes.
   *
   * @default true
   */
  strongEtag?: boolean;

  /**
   * Disable ETag generation completely for static files.
   *
   * Useful when you do not want to use conditional requests or caching based on ETag.
   *
   * @default false
   */
  disableEtag?: boolean;
};


/**
 * Represents the list of static files and their corresponding route paths.
 */
export type StaticFileArray = {
  /** Absolute path to the static file on the file system. */
  fileSource: string;

  /** Public route (URL path) where the file will be served. */
  route: string;
}[];

/**
 * Represents a static file configuration to be served by the server.
 */
export type ServeStatic = {
  /**
   * Array of static files and their corresponding route paths.
   */
  files: StaticFileArray;

  /**
   * Optional settings to control caching, headers, and allowed extensions.
   */
  options?: StaticServeOption;
};
// ! *********************** core/router.js ********************************

// 🔹 Required types
type ExtractParam<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? Param extends `${infer Name}?`
  ? { [K in Name]?: string | null } & ExtractParam<`/${Rest}`>
  : { [K in Param]: string } & ExtractParam<`/${Rest}`>
  : Path extends `${infer _Start}:${infer Param}`
  ? Param extends `${infer Name}?`
  ? { [K in Name]?: string | null }
  : { [K in Param]: string }
  : {};

// 🔹 Wildcard support
type ExtractWildcard<Path extends string> =
  Path extends `${string}*${infer Wildcard}`
  ? Wildcard extends ""
  ? { "*": string }
  : { [K in Wildcard]: string }
  : {};

export type ExtractRouteParams<Path extends string> = ExtractParam<Path> &
  ExtractWildcard<Path> &
  Record<string, string>;

// 🧠 This is your desired type
export type ExtractParamsFromPath<Path extends string> = (Path extends string
  ? ExtractRouteParams<Path>
  : {}) &
  Record<string, string>;

// ! *********************** core/response.js ********************************
/**
 * A function that continues the middleware chain.
 *
 * @returns A Promise that resolves when the next middleware completes.
 */
export type NextCallback = () => Promise<void>;

/**
 * Represents a base HTTP response.
 * It can either be a `Response` object or a `Promise` resolving to a `Response`.
 */
export type HttpBaseResponse = Response | Promise<Response>;

/**
 * The context object (`ctx`) passed to all handlers and middleware.
 *
 * @template T - Custom environment or app-level data.
 * @template Path - Type of the route path (optional).
 */
export type Ctx<T extends Record<string, any> = {}, Path extends string = any> = BaseContext<Path> & T & {
  [key: string]: any;
  /**
   * Response body, can be string, Buffer, stream, etc. like context propagation.
   * @private
   * @type {*}
   */
  body: any;
};

/**
 * A callback (handler) for a route.
 *
 * @template T - Context data type.
 * @template Path - Type of the route path.
 *
 * @param ctx - The context object for the request.
 * @returns An HTTP response or a promise that resolves to an HTTP response.
 */
export type Callback<T extends Record<string, any> = {}, Path extends string = any> = (ctx: Ctx<T, Path>) => HttpBaseResponse;

/**
 * Middleware function type used in TezX.
 * Similar to Koa-style middleware with `next()` chaining.
 *
 * @template T - Context data type.
 * @template Path - Type of the route path.
 *
 * @param ctx - The context object.
 * @param next - A callback to call the next middleware in the chain.
 * @returns An HTTP response, a promise, or a call to `next()`.
 */
export type Middleware<T extends Record<string, any> = {}, Path extends string = any> = (ctx: Ctx<T, Path>, next: NextCallback) => HttpBaseResponse | Promise<HttpBaseResponse | void> | NextCallback;

/**
 * Error handler function type.
 *
 * @template T - Context data type.
 *
 * @param err - The error that was thrown.
 * @param ctx - The context object where the error occurred.
 * @returns An HTTP response or a promise that resolves to an HTTP response.
 */
export type ErrorHandler<T extends Record<string, any> = {}> = (
  err: Error,
  ctx: Ctx<T>,
) => HttpBaseResponse;

// ! *********************** core/request.js ********************************
/**
 * Configuration options for parsing and validating multipart/form-data.
 */
export interface FormDataOptions {
  /**
   * If true, apply basic sanitization to incoming text fields.
   */
  sanitized?: boolean;

  /**
   * Whitelisted MIME types for uploaded files (e.g. ["image/jpeg", "image/png"]).
   */
  allowedTypes?: string[];

  /**
   * Maximum **per-file** size in bytes.
   */
  maxSize?: number;

  /**
   * Maximum number of files allowed **per field**.
   */
  maxFiles?: number;

  /**
   * Maximum **combined** size of all uploaded files in bytes.
   */
  maxTotalSize?: number;

  /**
   * Maximum length of a **single text field** (in characters/bytes, depending on your parser).
   */
  maxFieldSize?: number;
}

/**
 * Supported low-level transport types for network addresses.
 */
type TransportType = "tcp" | "udp" | "unix" | "pipe" | "unixpacket";


/**
 * Remote address details of the connected client.
 * @property {string} [transport] - Transport protocol (e.g., "tcp", "udp").
 * @property {"IPv4" | "IPv6" | "Unix"} [family] - Address family.
 * @property {string} [hostname] - Hostname or IP address.
 * @property {number} [port] - Port number.
 */
export type NetAddr = {
  /** Transport protocol used by the connection. */
  transport?: TransportType;

  /** Address family. */
  family?: "IPv4" | "IPv6" | "Unix";

  /** The IP/Unix path/etc. */
  address?: string;

  /** TCP/UDP port number (if applicable). */
  port?: number;
};

/**
 * Connection address metadata holding both local and remote endpoints.
 */
export type ConnAddress = {
  /** Remote peer address information. */
  remoteAddr: NetAddr;

  /** Local server address information. */
  localAddr: NetAddr;
};

/**
 * List of built-in, first-class supported HTTP methods.
 * "ALL" can be used to register a handler for every method.
 */
export const httpMethod = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "PATCH",
  "HEAD",
  "ALL",
  "TRACE",
  "CONNECT",
] as const;

/**
 * HTTP method type. Extensible to support custom verb strings.
 */
export type HTTPMethod = (typeof httpMethod)[number] | (string & {});

// ! ******************************** FOR ROUTER *************************************
/**
 * The result returned when searching for a route match.
 *
 * @template T - The type of the request context environment.
 */
export type RouteMatchResult<T extends Record<string, any> = any> = {
  /**
   * The HTTP method of the matched route (e.g., "GET", "POST").
   */
  method: HTTPMethod;

  /**
   * The middleware functions that will be executed for this route.
   */
  match: Middleware<T>[];

  /**
   * An object containing route parameters extracted from the URL.
   * The values can be strings, null (for optional params), or undefined.
   */
  params: Record<string, string | null | undefined>;
};

/**
 * The array type containing route handlers and middlewares for a route.
 *
 * @template T - The type of the request context environment.
 */
export type HandlerType<T extends Record<string, any> = any> = (
  | Callback<T>
  | Middleware<T>
)[];

/**
 * Interface representing a router.
 *
 * @template T - The type of the handler.
 */
export interface RouteRegistry {
  /**
   * The name of the router.
   */
  name: string;
  /**
   * Registers a route or middleware for a specific HTTP method.
   *
   * @param method - HTTP method (e.g., "GET", "POST", or "ALL" for middleware)
   * @param path - Route path (e.g., "/users", "/api")
   * @param handlers - Array of middleware or callback handlers
   */
  addRoute<T extends Record<string, any> = any>(
    method: HTTPMethod,
    path: string,
    handler: HandlerType<T>,
  ): void;
  /**
   * Find a route based on the given method and path.
   *
   * @param method - The HTTP method (e.g., 'get', 'post').
   * @param path - The path to match.
   * @returns The result of the match.
   */
  search(method: HTTPMethod, path: string): RouteMatchResult;
}
