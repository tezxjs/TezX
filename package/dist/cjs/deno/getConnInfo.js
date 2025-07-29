"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnInfo = getConnInfo;
function getConnInfo() {
    return (ctx, next) => {
        let connInfo = ctx.args?.[0];
        if (connInfo && connInfo.remoteAddr) {
            let remoteAddr = connInfo.remoteAddr;
            ctx.req.remoteAddress = {
                port: remoteAddr?.port,
                address: remoteAddr?.hostname,
                transport: remoteAddr?.transport,
                family: remoteAddr?.family,
            };
        }
        return next();
    };
}
