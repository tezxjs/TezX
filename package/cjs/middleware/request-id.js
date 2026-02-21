"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestID = exports.default = void 0;
const index_js_1 = require("../helper/index.js");
const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return function requestID(ctx, next) {
        let requestId = ctx.headers.get(headerName) ?? `req-${(0, index_js_1.generateUUID)()}`;
        ctx[contextKey] = requestId;
        ctx.headers.set(headerName, requestId);
        return next();
    };
};
exports.default = requestID;
exports.requestID = requestID;
