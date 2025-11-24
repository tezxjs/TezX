"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnInfo = getConnInfo;
function getConnInfo() {
    return (ctx, next) => {
        let server = ctx.server;
        if (server && server.requestIP) {
            ctx.req.remoteAddress = server.requestIP(ctx.rawRequest);
        }
        return next();
    };
}
exports.default = getConnInfo;
