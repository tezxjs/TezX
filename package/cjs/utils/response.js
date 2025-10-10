"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundResponse = void 0;
exports.handleErrorResponse = handleErrorResponse;
exports.toString = toString;
exports.determineContentTypeBody = determineContentTypeBody;
const config_js_1 = require("../core/config.js");
const error_js_1 = require("../core/error.js");
let notFoundResponse = (ctx) => {
    const { method, pathname } = ctx;
    return ctx.text(`${method}: '${pathname}' could not find\n`, {
        status: 404,
    });
};
exports.notFoundResponse = notFoundResponse;
async function handleErrorResponse(err = error_js_1.TezXError.internal(), ctx) {
    if (err instanceof error_js_1.TezXError) {
        config_js_1.GlobalConfig.debugging.error(err.details ?? err?.message);
        return ctx
            .status(err.statusCode ?? 500)
            .send(err.details ?? err?.message ?? "Internal Server Error");
    }
    return await handleErrorResponse(error_js_1.TezXError.internal(), ctx);
}
function toString(input, values) {
    if (typeof input === "string") {
        return input;
    }
    let result = "";
    for (let i = 0; i < input.length; i++) {
        result += input[i];
        if (i < values.length)
            result += values[i];
    }
    return result;
}
function determineContentTypeBody(body) {
    if (typeof body === "string" ||
        typeof body === "number" ||
        typeof body === "boolean") {
        return { type: "text/plain; charset=utf-8", body: String(body) };
    }
    if (body instanceof Uint8Array || body instanceof ArrayBuffer) {
        return { type: "application/octet-stream", body };
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) {
        return { type: "application/octet-stream", body };
    }
    if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
        return { type: "application/octet-stream", body };
    }
    if (typeof Blob !== "undefined" && body instanceof Blob) {
        return { type: body.type || "application/octet-stream", body };
    }
    if (typeof body === "object" && typeof body?.pipe === "function") {
        return { type: "application/octet-stream", body };
    }
    if (typeof body === "object") {
        return {
            type: "application/json; charset=utf-8",
            body: JSON.stringify(body),
        };
    }
    return { type: "text/plain; charset=utf-8", body: String(body ?? "") };
}
