import { defaultMimeType } from "../utils/mimeTypes.js";
import { mergeHeaders } from "../utils/response.js";
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
        const target = this.headers;
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
    createResponse(body, type, init = {}) {
        const headers = mergeHeaders(this.#headers, init.headers);
        if (type) {
            headers.set("Content-Type", type);
        }
        return new Response(body, {
            status: init.status ?? this.#status,
            statusText: init.statusText,
            headers,
        });
    }
    newResponse(body, init = {}) {
        return this.createResponse(body, null, init);
    }
    text(content, init) {
        return this.createResponse(content, "text/plain; charset=utf-8", init);
    }
    html(strings, init) {
        return this.createResponse(strings, "text/html; charset=utf-8", init);
    }
    json(json, init) {
        return this.createResponse(JSON.stringify(json), "application/json; charset=utf-8", init);
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
        return this.createResponse(stream, (init?.download || init?.filename) ? "application/octet-stream" : file?.type ?? defaultMimeType, {
            status: init?.status ?? this.#status,
            statusText: init?.statusText,
            headers,
        });
    }
    get server() {
        return this.#server;
    }
}
