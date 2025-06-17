import { Readable } from "node:stream";
export function toWebRequest(req, method = "GET") {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
            headers[key] = value.join(", ");
        }
        else if (typeof value === "string") {
            headers[key] = value;
        }
    }
    const isEncrypted = (req.socket && req.socket.encrypted) || false;
    const protocol = isEncrypted ? "https:" : "http:";
    let host = "localhost";
    const hostHeader = req.headers.host;
    if (typeof hostHeader === "string") {
        host = hostHeader;
    }
    const urlStr = req.url ?? "/";
    const fullUrl = new URL(urlStr, `${protocol}//${host}`);
    const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
    const body = hasBody ? Readable.toWeb(req) : undefined;
    const abortController = new AbortController();
    req?.once("close", () => abortController.abort());
    return new Request(fullUrl.href, {
        method,
        headers,
        body,
        signal: abortController.signal,
        duplex: hasBody ? "half" : undefined,
    });
}
