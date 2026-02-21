import { Context } from "../index.js";
import { Middleware } from "../types/index.js";
import { cryptoDigest } from "../utils/crypto.js";

/**
 * ETag Middleware for Bun
 *
 * Automatically generates ETag headers for responses.
 * Returns 304 Not Modified if client's If-None-Match matches the ETag.
 *
 * @param options.strongEtag - true for strong ETag (default), false for weak
 */
export function Etag<T extends Record<string, any> = {}, Path extends string = any>(options?: { strongEtag?: boolean }): Middleware<T, Path> {
    const strong = options?.strongEtag ?? true;

    return async (ctx: Context, next: () => Promise<Response | void>) => {
        // Call next middleware/handler
        const res = (await next()) ?? ctx.res as Response;

        // Only process valid responses
        if (!res || !res.status || res.status >= 400) return res;

        let bodyBuffer: ArrayBuffer;

        try {
            // Clone response to safely read body without consuming original
            const clone = res.clone ? res.clone() : res;

            // Read response body
            bodyBuffer = await clone.arrayBuffer();
        } catch {
            // If body cannot be read, skip ETag
            return res;
        }

        // Generate hash for ETag
        const hash = await cryptoDigest("md5", bodyBuffer, "hex");
        const etagVal = strong ? `"${hash}"` : `W/"${hash}"`;

        // Merge existing headers and add ETag
        const headers = new Headers(res.headers);
        headers.set("ETag", etagVal);

        // Check If-None-Match to return 304 Not Modified
        const ifNoneMatch = ctx.req.header("if-none-match");
        if (ifNoneMatch === etagVal) {
            return new Response(null, { status: 304, headers });
        }

        // Return original response with ETag header
        return new Response(bodyBuffer, {
            status: res.status,
            statusText: res.statusText,
            headers,
        });
    };
}
export default Etag;
