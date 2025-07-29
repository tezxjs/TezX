import { Middleware, WebSocketCallback, WebSocketOptions } from "../types/index.js";
export type DenoWebsocketOptions = {
    /**
   * Supported WebSocket subprotocols. (Deno only)
   */
    protocol?: string;
    /**
     * Time (in seconds) after which the WebSocket connection will be closed if idle. (Deno only)
     */
    idleTimeout?: number;
};
/**
 * Middleware to upgrade an HTTP request to a WebSocket connection.
 *
 * This function is designed to work in a Deno environment where `Deno.upgradeWebSocket`
 * is available. It checks the necessary WebSocket headers and, if valid,
 * upgrades the connection and binds lifecycle event handlers.
 *
 * @template T - Context object type which must include `wsProtocol`.
 * @template Path - Route path type.
 *
 * @param {WebSocketCallback} callback - A function that returns WebSocket event handlers (open, message, close, error).
 * @param {WebSocketOptions} [options={}] - Optional WebSocket configuration:
 *   - `protocol`?: string – Subprotocol.
 *   - `idleTimeout`?: number – Idle timeout in seconds.
 *   - `onUpgradeError`?: (error: Error, ctx: T) => any – Custom handler for upgrade errors.
 *
 * @returns {Middleware<T, Path>} A middleware function to be used in a compatible HTTP/WebSocket server framework.
 *
 * @example
 * ```ts
 * app.use("/ws", upgradeWebSocket((ctx) => ({
 *   open: (socket) => console.log("WebSocket open"),
 *   message: (socket, msg) => socket.send(`You said: ${msg}`),
 *   close: () => console.log("Closed"),
 *   error: (socket, err) => console.error("WebSocket error:", err),
 * })));
 * ```
 */
export declare function upgradeWebSocket<T extends Record<string, any> & {
    wsProtocol: "wss" | "ws";
}, Path extends string = any>(callback: WebSocketCallback, options?: WebSocketOptions & DenoWebsocketOptions): Middleware<T, Path>;
