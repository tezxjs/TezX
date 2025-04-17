"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestID = void 0;
const index_js_1 = require("../helper/index.js");
const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return (ctx, next) => {
        const existingID = ctx.headers?.get(headerName.toLowerCase()) ||
            ctx.headers?.get(headerName);
        const requestId = existingID || `req-${(0, index_js_1.generateID)()}`;
        ctx[contextKey] = requestId;
        ctx.header(headerName, requestId);
        return next();
    };
};
exports.requestID = requestID;
