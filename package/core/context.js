import { defaultMimeType, mimeTypes } from "../utils/mimeTypes.js";
import { mergeHeaders } from "../utils/response.js";
import { extensionExtract } from "../utils/utils.js";
import { TezXRequest } from "./request.js";
export class Context {
    #status = 200;
    #headers;
    #req = null;
    params = {};
    rawRequest;
    #server;
    url;
    res;
    pathname;
    method;
    constructor(req, pathname, method, server) {
        this.#server = server;
        this.rawRequest = req;
        this.url = req.url;
        this.pathname = pathname;
        this.method = method;
    }
    get headers() {
        return this.res?.headers ?? (this.#headers ??= new Headers());
    }
    setHeader(key, value, options) {
        if (!value)
            return this;
        const _key = key.toLowerCase();
        const append = options?.append || _key === "set-cookie";
        const target = this.res?.headers ?? (this.#headers ??= new Headers());
        if (append) {
            target.append(_key, value);
        }
        else {
            target.set(_key, value);
        }
        return this;
    }
    get req() {
        return (this.#req ??= new TezXRequest(this.rawRequest, this.method, this.pathname, this.params));
    }
    status(status) {
        this.#status = status;
        return this;
    }
    #newResponse(body, type, init = {}) {
        let headers = mergeHeaders(this.#headers, init.headers);
        if (!headers.has("Content-Type"))
            headers.set("Content-Type", type);
        return new Response(body, {
            status: init.status ?? this.#status,
            statusText: init.statusText,
            headers,
        });
    }
    newResponse(body, init = {}) {
        let headers = mergeHeaders(this.#headers, init.headers);
        return new Response(body, {
            status: init.status ?? this.#status,
            statusText: init.statusText,
            headers,
        });
    }
    text(content, init) {
        return this.#newResponse(content, "text/plain; charset=utf-8", init);
    }
    html(strings, init) {
        return this.#newResponse(strings, "text/html; charset=utf-8", init);
    }
    json(json, init) {
        return this.#newResponse(JSON.stringify(json), "application/json; charset=utf-8", init);
    }
    send(body, init) {
        let _body;
        let type;
        if (body === null || body === undefined) {
            _body = "";
            type = "text/plain";
        }
        else if (typeof body === "string" || typeof body === "number") {
            _body = body;
            type = "text/plain";
        }
        else if (body instanceof Uint8Array || body instanceof ArrayBuffer || (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)) {
            _body = body;
            type = "application/octet-stream";
        }
        else if (body instanceof Blob || (typeof File !== "undefined" && body instanceof File)) {
            _body = body;
            type = body.type || "application/octet-stream";
        }
        else if (typeof body === "object") {
            _body = JSON.stringify(body);
            type = "application/json";
        }
        else {
            _body = String(body);
            type = "text/plain";
        }
        return this.#newResponse(_body, type, init);
    }
    redirect(url, status = 302) {
        const headers = new Headers(this.#headers);
        headers.set("Location", url);
        return new Response(null, { status, headers });
    }
    async sendFile(filePath, init) {
        let file = Bun.file(filePath);
        if (!await file.exists()) {
            this.#status = 404;
            throw Error("File not found");
        }
        ;
        let size = file.size;
        let stream = file.stream();
        let headers = init?.headers ?? {};
        headers['Content-Length'] = size.toString();
        if (init?.filename) {
            headers["Content-Disposition"] = `attachment; filename="${init?.filename}"`;
        }
        if (init?.download || init?.filename) {
            headers["Content-Type"] = "application/octet-stream";
            return this.newResponse(stream, {
                status: init?.status ?? this.#status,
                statusText: init?.statusText,
                headers,
            });
        }
        const ext = extensionExtract(filePath);
        const mimeType = mimeTypes[ext] ?? defaultMimeType;
        headers["Content-Type"] = mimeType;
        return this.newResponse(stream, {
            status: init?.status ?? this.#status,
            statusText: init?.statusText,
            headers,
        });
    }
    get server() {
        return this.#server;
    }
}
