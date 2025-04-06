import { HeadersParser } from "./header";
import { UrlRef } from "../utils/url";
export type FormDataOptions = {
  maxSize?: number;
  allowedTypes?: string[];
  sanitized?: boolean;
  maxFiles?: number;
};
type TransportType = "tcp" | "udp" | "unix" | "pipe";
export type AddressType = {
  transport?: TransportType;
  family?: "IPv4" | "IPv6" | "Unix";
  address?: string;
  port?: number;
};
export type ConnAddress = {
  remoteAddr: AddressType;
  localAddr: AddressType;
};
export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "OPTIONS"
  | "PATCH"
  | "HEAD"
  | "ALL"
  | "TRACE"
  | "CONNECT"
  | string;
export declare class Request {
  headers: HeadersParser;
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
   * ```ts
   * ctx.req.remoteAddress
   * ```
   */
  remoteAddress: AddressType;
  constructor(
    req: any,
    params: Record<string, any>,
    remoteAddress: AddressType,
  );
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
