export function getConnInfo() {
    return (ctx, next) => {
        let server = ctx.server;
        if (server && server.requestIP) {
            ctx.req.remoteAddress = server.requestIP(ctx.rawRequest);
        }
        return next();
    };
}
export default getConnInfo;
