export class DenoTransport {
    async upgrade(ctx, event, options) {
        const { socket, response } = Deno.upgradeWebSocket(ctx.req.rawRequest, {
            protocols: options.protocols,
            idleTimeout: options.idleTimeout,
            headers: {},
        });
        this.setupHandlers(socket, ctx, event, options);
        return response;
    }
    setupHandlers(ws, ctx, event, options) {
        ws.onopen = () => event.open?.(ws, ctx);
        ws.onmessage = (e) => event.message?.(ws, e.data);
        ws.onclose = (e) => event.close?.(ws, { code: e.code, reason: e.reason });
        ws.onerror = (err) => event.error?.(ws, err);
    }
}
