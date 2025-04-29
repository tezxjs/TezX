"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poweredBy = void 0;
const poweredBy = (serverName) => {
    return (ctx, next) => {
        ctx.header("X-Powered-By", serverName || "TezX");
        return next();
    };
};
exports.poweredBy = poweredBy;
