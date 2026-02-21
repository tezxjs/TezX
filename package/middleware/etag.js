import { cryptoDigest } from "../utils/crypto.js";
export function Etag(options) {
    const strong = options?.strongEtag ?? true;
    return async (ctx, next) => {
        const res = (await next()) ?? ctx.res;
        if (!res || !res.status || res.status >= 400)
            return res;
        let bodyBuffer;
        try {
            const clone = res.clone ? res.clone() : res;
            bodyBuffer = await clone.arrayBuffer();
        }
        catch {
            return res;
        }
        const hash = await cryptoDigest("md5", bodyBuffer, "hex");
        const etagVal = strong ? `"${hash}"` : `W/"${hash}"`;
        const headers = new Headers(res.headers);
        headers.set("ETag", etagVal);
        const ifNoneMatch = ctx.req.header("if-none-match");
        if (ifNoneMatch === etagVal) {
            return new Response(null, { status: 304, headers });
        }
        return new Response(bodyBuffer, {
            status: res.status,
            statusText: res.statusText,
            headers,
        });
    };
}
export default Etag;
