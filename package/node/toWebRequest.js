import { Readable } from "node:stream";
export function toWebRequest(req, method = "GET") {
    const protocol = (req.socket && req.socket.encrypted) ? "https:" : "http:";
    const upperMethod = method.length === 3
        ? (method === "get" ? "GET" : (method === "put" ? "PUT" : method.toUpperCase()))
        : method.toUpperCase();
    let host = req.headers.host || "localhost";
    const hasBody = upperMethod !== "GET" && upperMethod !== "HEAD";
    const abortController = new AbortController();
    req?.once("close", () => abortController.abort());
    return new Request(protocol + "//" + host + (req.url ?? "/"), {
        method,
        headers: req?.headers,
        body: hasBody ? Readable.toWeb(req) : undefined,
        signal: abortController.signal,
        duplex: hasBody ? "half" : undefined,
    });
}
