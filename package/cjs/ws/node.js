"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTransport = void 0;
class NodeTransport {
    wss;
    async upgrade(ctx, event, options) {
        let { WebSocketServer } = await Promise.resolve().then(() => require("ws"));
        return (ctx, server) => {
            this.wss = new WebSocketServer({
                noServer: true,
                maxPayload: options.maxPayload ?? 1048576,
                perMessageDeflate: options.perMessageDeflate ?? false,
            });
            server.on("upgrade", (request, socket, head) => {
                this.wss?.handleUpgrade(request, socket, head, (ws) => {
                    this.wss?.emit("connection", ws, request);
                    this.setupHandlers(ws, event, options);
                });
            });
        };
    }
    setupHandlers(ws, event, options) {
        event.open?.(ws);
        ws.on("open", () => event.open?.(ws));
        ws.on("message", (data) => event.message?.(ws, data));
        ws.on("close", (code, reason) => event.close?.(ws, { code, reason }));
        ws.on("error", (err) => event.error?.(ws, err));
        ws.on("ping", (data) => event.ping?.(ws, data));
        ws.on("pong", (data) => event.pong?.(ws, data));
    }
}
exports.NodeTransport = NodeTransport;
