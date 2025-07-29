import { Middleware, WebSocketCallback, WebSocketOptions } from "../types/index.js";
/**
 * Creates a middleware that upgrades an HTTP request to a WebSocket connection
 * if the request meets the WebSocket upgrade protocol.
 *
 * Supports Bun natively. Node.js requires `req` + `socket` to be passed correctly.
 */
export declare function upgradeWebSocket<T extends Record<string, any> & {
    wsProtocol: "wss" | "ws";
}, Path extends string = any>(callback: WebSocketCallback, options?: WebSocketOptions): Middleware<T, Path>;
export default upgradeWebSocket;
