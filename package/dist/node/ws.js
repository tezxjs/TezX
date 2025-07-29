import { WebSocketServer } from "ws";
export function upgradeWebSocket(callback, options = {}) {
    const { onUpgradeError = (error, ctx) => {
        ctx.setStatus = 401;
        return ctx.text(error.message);
    }, } = options;
    return async (ctx, next) => {
        const upgrade = ctx.req.header("upgrade")?.toLowerCase();
        const connection = ctx.req.header("connection")?.toLowerCase();
        const key = ctx.req.header("sec-websocket-key");
        if (upgrade !== "websocket" || !connection?.includes("upgrade") || !key) {
            if (next) {
                ctx.body = { error: "401 Bad Request: Invalid WebSocket headers" };
                return next();
            }
            ctx.setStatus = 401;
            return onUpgradeError(new Error("401 Bad Request: Invalid WebSocket headers"), ctx);
        }
        ctx.wsProtocol = ctx.url?.startsWith("https") ? "wss" : "ws";
        const server = ctx.args?.[2];
        if (!server?.on) {
            ctx.setStatus = 500;
            return onUpgradeError(new Error("Node server instance missing for WebSocket"), ctx);
        }
        const wss = new WebSocketServer({
            noServer: true,
            maxPayload: options.maxPayload ?? 1048576,
            perMessageDeflate: options.perMessageDeflate ?? false,
        });
        server.on("upgrade", (request, socket, head) => {
            wss?.handleUpgrade(request, socket, head, (ws) => {
                wss?.emit("connection", ws, request);
                let event = callback(ctx);
                event.open?.(ws);
                ws.on("open", () => event.open?.(ws));
                ws.on("message", (data) => event.message?.(ws, data));
                ws.on("close", (code, reason) => event.close?.(ws, { code, reason }));
                ws.on("error", (err) => event.error?.(ws, err));
                ws.on("ping", (data) => event.ping?.(ws, data));
                ws.on("pong", (data) => event.pong?.(ws, data));
            });
        });
        return next();
    };
}
