"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.poweredBy = void 0;
const poweredBy = (serverName) => {
    return function poweredBy(ctx, next) {
        ctx.headers.set("x-powered-by", serverName || "TezX");
        return next();
    };
};
exports.poweredBy = poweredBy;
exports.default = poweredBy;
