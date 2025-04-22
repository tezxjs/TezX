import { CallbackReturn, Middleware } from "../core/router.js";
import { Context } from "../index.js";
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
    close?: WebSocketHandler<{
        code: number;
        reason: string;
    }>;
    /**
     * Triggered when an error occurs during the WebSocket lifecycle.
     * Not supported in Bun.
     */
    error?: WebSocketHandler<Error | any>;
    /**
     * Triggered when the socket drain event occurs.
     * Not supported in Deno and Node.
     */
    drain?: WebSocketHandler;
    /**
     * Triggered when a ping frame is received from the client.
     * Not supported in Deno.
     */
    ping?: WebSocketHandler<Buffer>;
    /**
     * Triggered when a pong frame is received from the client.
     * Not supported in Deno.
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
 * Options for Zlib compression and decompression (Node.js only).
 */
interface ZlibOptions {
    /**
     * The flush flag used by default.
     * @default constants.Z_NO_FLUSH
     */
    flush?: number;
    /**
     * The flush flag used when calling the end() method.
     * @default constants.Z_FINISH
     */
    finishFlush?: number;
    /**
     * The chunk size to use during compression.
     * @default 16 * 1024 (16384 bytes)
     */
    chunkSize?: number;
    /**
     * The base two logarithm of the window size (range: 8–15).
     */
    windowBits?: number;
    /**
     * Compression level (range: 0–9).
     * 0 = no compression, 9 = max compression.
     */
    level?: number;
    /**
     * Specifies how much memory should be allocated for internal compression state (1–9).
     * Only used during compression.
     */
    memLevel?: number;
    /**
     * Compression strategy to use (e.g., Z_DEFAULT_STRATEGY).
     * Only applies during compression.
     */
    strategy?: number;
    /**
     * A dictionary to use during compression/decompression.
     * Useful for specific protocols.
     */
    dictionary?: NodeJS.ArrayBufferView | ArrayBuffer;
    /**
     * If true, returns an object with `buffer` and `engine`.
     */
    info?: boolean;
}
interface ZlibInflateOptions extends ZlibOptions {
    /**
     * Limit the output buffer size when using convenience methods like `deflateSync`.
     * @default buffer.kMaxLength
     */
    maxOutputLength?: number;
}
/**
 * Options for enabling and configuring permessage-deflate compression in WebSocket.
 * Applicable only in Node.js environments.
 */
interface PerMessageDeflateOptions {
    /**
     * When true, disables context takeover on the server side.
     * This can help reduce memory usage at the cost of compression efficiency.
     */
    serverNoContextTakeover?: boolean;
    /**
     * When true, disables context takeover on the client side.
     */
    clientNoContextTakeover?: boolean;
    /**
     * Specifies the server's maximum window bits (compression history buffer size).
     */
    serverMaxWindowBits?: number;
    /**
     * Specifies the client's maximum window bits.
     */
    clientMaxWindowBits?: number;
    /**
     * Options passed directly to zlib for the deflate (compression) stream.
     */
    zlibDeflateOptions?: ZlibOptions;
    /**
     * Options passed to zlib for the inflate (decompression) stream.
     */
    zlibInflateOptions?: ZlibInflateOptions;
    /**
     * Only compress messages bigger than this threshold (in bytes).
     */
    threshold?: number;
    /**
     * Limits how many concurrent zlib operations can be running.
     * Useful for limiting CPU/memory usage under heavy load.
     */
    concurrencyLimit?: number;
}
/**
 * Dynamic options for configuring WebSocket behavior across different runtimes.
 */
export type WebSocketOptions = {
    /**
     * Called when an error occurs during the upgrade process.
     */
    onUpgradeError?: (err: Error, ctx: Context) => CallbackReturn;
    /**
     * Supported WebSocket subprotocols. (Deno only)
     */
    protocols?: string[];
    /**
     * Time (in seconds) after which the WebSocket connection will be closed if idle. (Deno only)
     */
    idleTimeout?: number;
    /**
     * Enables per-message deflate compression. Can be a boolean or a detailed config. (Node.js only)
     */
    perMessageDeflate?: boolean | PerMessageDeflateOptions;
    /**
     * Maximum allowed message size in bytes. Default is 1MB if not provided. (Node.js only)
     */
    maxPayload?: number;
};
export declare function upgradeWebSocket(callback: WebSocketCallback, options?: WebSocketOptions): Middleware;
export {};
