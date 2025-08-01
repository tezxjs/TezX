import type { PerMessageDeflateOptions } from "ws";
import { Middleware, WebSocketCallback, WebSocketOptions } from "../types/index.js";
export type nodeWebSocketOptions = {
    /**
     * Enables per-message deflate compression. Can be a boolean or a detailed config. (Node.js only)
     */
    perMessageDeflate?: boolean | PerMessageDeflateOptions;
    /**
     * Maximum allowed message size in bytes. Default is 1MB if not provided. (Node.js only)
     */
    maxPayload?: number;
};
/**
 * Creates a Node.js-specific WebSocket upgrade middleware.
 *
 * This middleware validates WebSocket upgrade headers and upgrades the HTTP connection
 * to a WebSocket connection using the `ws` library. It binds event handlers
 * (`open`, `message`, `close`, `error`, `ping`, `pong`) based on the provided callback.
 *
 * @template T - Context type extending object with `wsProtocol` property ("ws" or "wss").
 * @template Path - Route path type (string).
 *
 * @param {WebSocketCallback} callback - Function that returns WebSocket event handlers.
 * @param {WebSocketOptions} [options={}] - Options for WebSocket upgrade behavior.
 * @param {(error: Error, ctx: T) => any} [options.onUpgradeError] - Custom error handler for upgrade failures.
 * @param {number} [options.maxPayload=1048576] - Maximum allowed payload size (in bytes).
 * @param {boolean} [options.perMessageDeflate=false] - Whether to enable per-message deflate.
 *
 * @returns {Middleware<T, Path>} Middleware function for handling WebSocket upgrade requests.
 *
 * @throws Will return a 401 response if WebSocket upgrade headers are invalid.
 * @throws Will return a 500 response if Node.js HTTP server instance is missing in context arguments.
 *
 * @example
 * ```ts
 * import { upgradeWebSocket } from "./nodeWebSocket.js";
 *
 * const wsMiddleware = upgradeWebSocket(ctx => ({
 *   open(ws) {
 *     console.log("WebSocket connection opened");
 *   },
 *   message(ws, data) {
 *     console.log("Received message:", data);
 *   },
 *   close(ws, event) {
 *     console.log("Connection closed:", event.code, event.reason);
 *   },
 *   error(ws, err) {
 *     console.error("WebSocket error:", err);
 *   },
 * }));
 * ```
 */
export declare function upgradeWebSocket<T extends Record<string, any> & {
    wsProtocol: "wss" | "ws";
}, Path extends string = any>(callback: WebSocketCallback, options?: WebSocketOptions & nodeWebSocketOptions): Middleware<T, Path>;
