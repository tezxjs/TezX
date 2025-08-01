export function getConnInfo() {
    return (ctx, next) => {
        let request = ctx.args?.[0];
        if (request && request.socket) {
            ctx.req.remoteAddress = {
                family: request.socket.remoteFamily,
                address: request.socket.remoteAddress,
                port: request.socket.remotePort,
            };
        }
        return next();
    };
}
