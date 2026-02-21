import { Middleware, WebSocketCallback, WebSocketEvent, WebSocketOptions } from "../types/index.js";
export { WebSocketCallback, WebSocketEvent, WebSocketOptions };
/**
 * Creates a middleware that upgrades an HTTP request to a WebSocket connection
 * if the request meets the WebSocket upgrade protocol.
 *
 * Supports Bun natively. Node.js requires `req` + `socket` to be passed correctly.
 */
export declare function upgradeWebSocket<T extends Record<string, any> & {
    wsProtocol: "wss" | "ws";
}, Path extends string = any>(callback: WebSocketCallback, options?: WebSocketOptions): Middleware<T, Path>;
export type wsHandlersOptions = {
    /**
     * Maximum payload size in bytes. Default: 16 MB.
     */
    maxPayloadLength?: number;
    /**
     * Maximum backpressure limit in bytes. Default: 16 MB.
     */
    backpressureLimit?: number;
    /**
     * Close connection when backpressure limit reached. Default: false.
     */
    closeOnBackpressureLimit?: boolean;
    /**
     * Idle timeout in seconds. Default: 120 (2 minutes).
     */
    idleTimeout?: number;
    /**
     * Whether ws.publish() sends message to itself if subscribed. Default: false.
     */
    publishToSelf?: boolean;
    /**
     * Whether the server sends/responds to pings automatically. Default: true.
     */
    sendPings?: boolean;
    /**
     * Compression settings for per-message deflate.
     */
    perMessageDeflate?: boolean | {
        compress?: Bun.WebSocketCompressor | boolean;
        decompress?: Bun.WebSocketCompressor | boolean;
    };
};
/**
 * Returns a Bun-compatible WebSocketHandler with optional custom options.
 */
export declare const wsHandlers: <T extends any>(options?: wsHandlersOptions) => Bun.WebSocketHandler<T>;
export default upgradeWebSocket;
