import fs from "node:fs";
import path from "node:path";
import { Context } from "../index.js";
import { HttpBaseResponse, ResponseHeaders, ResponseInit } from "../types/index.js";
import { mimeTypes } from "../utils/mimeTypes.js";

/**
 * Async Promise-based sendFile (Node.js, no third-party mime lib)
 */
export async function sendFile(
    ctx: Context,
    filePath: string,
    init?: ResponseInit & { filename?: string; download?: boolean }
): Promise<HttpBaseResponse> {

    let stat;
    try {
        stat = await fs.promises.stat(filePath);
    } catch {
        ctx.status(404);
        throw new Error("File not found");
    }

    const size = stat.size;

    const stream = fs.createReadStream(filePath);

    const ext = path.extname(filePath).replace(".", "").toLowerCase();
    const headers: ResponseHeaders = init?.headers ?? {};

    headers["Content-Length"] = String(size);

    if (init?.download || init?.filename) {
        const filename = init?.filename || path.basename(filePath);
        headers["Content-Disposition"] =
            `attachment; filename="${filename}"`;
    }

    return ctx.createResponse(
        stream as any,
        init?.download || init?.filename
            ? "application/octet-stream"
            : (mimeTypes[ext as keyof typeof mimeTypes] || "application/octet-stream")
        , {
            headers: headers
        });
}