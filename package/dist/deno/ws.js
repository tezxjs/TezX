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
            ctx.setStatus = 401;
            const error = new Error("Invalid WebSocket upgrade request.");
            return next ? next() : onUpgradeError(error, ctx);
        }
        ctx.wsProtocol = ctx.url?.startsWith("https") ? "wss" : "ws";
        try {
            if (typeof callback !== "function") {
                throw new Error("Missing or invalid WebSocket callback handler.");
            }
            const { socket, response } = Deno.upgradeWebSocket(ctx.rawRequest, {
                protocol: options.protocol,
                idleTimeout: options.idleTimeout,
            });
            const event = callback(ctx);
            socket.onopen = () => event.open?.(socket, ctx);
            socket.onmessage = (e) => event.message?.(socket, e.data);
            socket.onclose = (e) => event.close?.(socket, { code: e.code, reason: e.reason });
            socket.onerror = (err) => event.error?.(socket, err);
            return response;
        }
        catch (err) {
            return onUpgradeError(err instanceof Error ? err : new Error("WebSocket Upgrade Failed"), ctx);
        }
    };
}
