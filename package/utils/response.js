import { GlobalConfig } from "../core/config.js";
import { TezXError } from "../core/error.js";
export let notFoundResponse = (ctx) => {
    const { method, pathname } = ctx;
    return ctx.text(`${method}: '${pathname}' could not find\n`, {
        status: 404,
    });
};
export async function handleErrorResponse(err = TezXError.internal(), ctx) {
    if (err instanceof TezXError) {
        GlobalConfig.debugging.error(err.details ?? err?.message);
        return ctx.status(err.statusCode ?? 500).send(err.details ?? err?.message ?? "Internal Server Error");
    }
    return await handleErrorResponse(TezXError.internal(), ctx);
}
export function toString(input, values) {
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
export function determineContentTypeBody(body) {
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
