"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.requestID = void 0;
const index_js_1 = require("../../helper/index.js");
const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return function requestID(ctx, next) {
        let requestId = ctx.header(headerName);
        if (!requestId) {
            requestId = `req-${(0, index_js_1.generateUUID)()}`;
        }
        ctx[contextKey] = requestId;
        ctx.setHeader(headerName, requestId);
        return next();
    };
};
exports.requestID = requestID;
exports.default = requestID;
