export let notFoundResponse = (ctx) => {
    const { method, pathname, } = ctx;
    return ctx.text(`${method}: '${pathname}' could not find\n`, {
        status: 404
    });
};
export async function handleErrorResponse(message = new Error("Internal Server Error"), ctx) {
    let error = message;
    if (message instanceof Error) {
        error = message.stack;
    }
    return ctx.text(error, {
        status: 500
    });
}
export function determineContentTypeBody(body) {
    if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
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
    if (typeof body === "object" && typeof body.pipe === "function") {
        return { type: "application/octet-stream", body };
    }
    if (typeof body === "object") {
        return { type: "application/json; charset=utf-8", body: JSON.stringify(body) };
    }
    return { type: "text/plain; charset=utf-8", body: String(body ?? "") };
}
