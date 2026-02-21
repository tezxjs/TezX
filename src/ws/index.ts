import { Middleware, WebSocketCallback, WebSocketEvent, WebSocketOptions, } from "../types/index.js";

export {
  WebSocketCallback, WebSocketEvent, WebSocketOptions
};

/**
 * Creates a middleware that upgrades an HTTP request to a WebSocket connection
 * if the request meets the WebSocket upgrade protocol.
 *
 * Supports Bun natively. Node.js requires `req` + `socket` to be passed correctly.
 */
export function upgradeWebSocket<T extends Record<string, any> & { wsProtocol: "wss" | "ws" }, Path extends string = any,>(callback: WebSocketCallback, options: WebSocketOptions = {},): Middleware<T, Path> {
  const {
    onUpgradeError = (error, ctx) => {
      return ctx.status(401).text(error.message);
    },
  } = options;

  return async (ctx, next) => {
    const upgrade = ctx.req.header("upgrade")?.toLowerCase();
    const connection = ctx.req.header("connection")?.toLowerCase();
    const key = ctx.req.header("sec-websocket-key");
    if (upgrade !== "websocket" || !connection?.includes("upgrade") || !key) {
      if (next) {
        ctx.body = { error: "401 Bad Request: Invalid WebSocket headers" };
        return next();
      }
      ctx.status(401);
      return onUpgradeError(new Error("401 Bad Request: Invalid WebSocket headers"), ctx);
    }
    ctx.wsProtocol = ctx.url?.startsWith("https") ? "wss" : "ws";
    if (!callback) {
      throw new Error("WebSocket callback is missing. Please provide a valid callback function to handle the WebSocket events.");
    }
    let server = ctx.server;
    if (!server?.upgrade) {
      return onUpgradeError(new Error("Bun server instance missing for WebSocket"), ctx);
    }
    const success = server.upgrade(ctx.rawRequest, {
      data: callback(ctx),
    });
    if (success) return undefined;
    return next();
  };
}

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
  perMessageDeflate?:
  | boolean
  | {
    compress?: Bun.WebSocketCompressor | boolean;
    decompress?: Bun.WebSocketCompressor | boolean;
  };
};
/**
 * Returns a Bun-compatible WebSocketHandler with optional custom options.
 */
export const wsHandlers = <T extends any>(options?: wsHandlersOptions): Bun.WebSocketHandler<T> => {
  return {
    open(ws) {
      return (ws.data as any)?.open?.(ws);
    },
    message(ws, msg) {
      return (ws.data as any)?.message?.(ws, msg);
    },
    close(ws, code, reason) {
      return (ws.data as any)?.close?.(ws, { code, reason });
    },
    ping(ws, data) {
      return (ws.data as any)?.ping?.(ws, data);
    },
    pong(ws, data) {
      return (ws.data as any)?.pong?.(ws, data);
    },
    drain(ws) {
      return (ws.data as any)?.drain?.(ws);
    },
    // Spread optional configuration
    ...options,
  };
};

export default upgradeWebSocket;
