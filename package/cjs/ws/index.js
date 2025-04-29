"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeWebSocket = upgradeWebSocket;
const environment_js_1 = require("../core/environment.js");
const deno_js_1 = require("./deno.js");
const node_js_1 = require("./node.js");
function upgradeWebSocket(callback, options = {}) {
  const {
    onUpgradeError = (error, ctx) => {
      ctx.setStatus = 401;
      return ctx.text(error.message);
    },
    protocols = [],
    idleTimeout = 30000,
    perMessageDeflate,
    maxPayload = 1048576,
  } = options;
  return async (ctx, next) => {
    const upgrade = ctx.req.headers.get("upgrade")?.toLowerCase();
    const connection = ctx.req.headers.get("connection")?.toLowerCase();
    const key = ctx.req.headers.get("sec-websocket-key");
    if (upgrade !== "websocket" || !connection?.includes("upgrade") || !key) {
      if (next) {
        ctx.body = { error: "401 Bad Request: Invalid WebSocket headers" };
        return next();
      }
      ctx.setStatus = 401;
      return onUpgradeError(
        new Error("401 Bad Request: Invalid WebSocket headers"),
        ctx,
      );
    }
    ctx.wsProtocol = ctx.req.urlRef.protocol === "https:" ? "wss" : "ws";
    try {
      const env = environment_js_1.EnvironmentDetector.getEnvironment;
      if (!callback) {
        throw new Error(
          "WebSocket callback is missing. Please provide a valid callback function to handle the WebSocket events.",
        );
      }
      let websocketCallback = callback(ctx);
      switch (env) {
        case "deno":
          return new deno_js_1.DenoTransport().upgrade(ctx, websocketCallback, {
            idleTimeout,
            protocols,
          });
        case "bun":
          return callback;
        case "node":
          return new node_js_1.NodeTransport().upgrade(ctx, websocketCallback, {
            maxPayload,
            perMessageDeflate,
          });
        default:
          throw new Error("Unsupported environment for WebSocket upgrade.");
      }
    } catch (err) {
      return onUpgradeError(new Error("WebSocket Upgrade Failed"), ctx);
    }
  };
}
