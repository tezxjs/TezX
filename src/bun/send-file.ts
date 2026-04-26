import { Context } from "../index.js";
import { HttpBaseResponse, ResponseHeaders, ResponseInit } from "../types/index.js";
declare const Bun: any;

/**
  *
  * Behaviors:
  *  - If only `filePath` is provided → serves file normally.
  *  - If `filename` is provided → forces browser download.
  *  - If `download: true` is provided → forces download using original filename.
  *
  * Automatically sets:
  *  - Content-Type (based on extension)
  *  - Content-Length
  *
  * @param {string} filePath - Absolute path to the file.
  * @param {Object} [init] - Optional settings.
  * @param {boolean} [init.download] - Force download.
  * @param {string} [init.filename] - Optional download filename.
  * @param {ResponseInit["headers"]} [init.headers] - Additional headers.
  *
  * @returns {Promise<HttpBaseResponse>} Stream response.
  *
  * @throws {Error} If file does not exist.
  *
  * @example
  * await ctx.sendFile("/assets/logo.png");
  *
  * @example
  * await ctx.sendFile("/data/report.pdf", { download: true });
  *
  * @example
  * await ctx.sendFile("/data/report.pdf", { filename: "my-report.pdf" });
  */
export async function sendFile(ctx: Context, filePath: string, init?: ResponseInit & { filename?: string; download?: boolean }): Promise<HttpBaseResponse> {
    let file = Bun.file(filePath);
    if (!await file.exists()) {
        ctx.status(404);
        throw Error("File not found")
    };
    let size = file.size;
    let stream = file.stream();
    let headers: ResponseHeaders = init?.headers ?? {}
    headers['Content-Length'] = size.toString();

    if (init?.filename) {
        headers["Content-Disposition"] = `attachment; filename="${init?.filename}"`;
    }

    return ctx.createResponse(stream as any, (init?.download || init?.filename) ? "application/octet-stream" : file?.type ?? "application/octet-stream", { headers: headers });
}