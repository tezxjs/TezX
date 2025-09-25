import { fileExists, fileSize, getFileBuffer, readStream, } from "../utils/file.js";
import { extensionExtract } from "../utils/low-level.js";
import { defaultMimeType, mimeTypes } from "../utils/mimeTypes.js";
import { determineContentTypeBody, toString } from "../utils/response.js";
import { TezXRequest } from "./request.js";
export class Context {
    #status = 200;
    #headers;
    #req = null;
    #params = {};
    rawRequest;
    #args;
    #body;
    url;
    res;
    env = {};
    pathname;
    method;
    constructor(req, pathname, method, env, args) {
        this.#args = args;
        this.rawRequest = req;
        this.url = req.url;
        this.pathname = pathname;
        this.env = env ?? {};
        this.method = method;
    }
    get getStatus() {
        return this.#status;
    }
    set setStatus(code) {
        this.#status = code;
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
    set params(params) {
        this.#params = params;
    }
    get req() {
        return (this.#req ??= new TezXRequest(this.rawRequest, this.method, this.pathname, this.#params));
    }
    get body() {
        return this.#body;
    }
    set body(value) {
        this.#body = value;
    }
    status = (status) => {
        this.#status = status;
        return this;
    };
    #newResponse(body, type, init = {}) {
        const headers = new Headers(this.#headers);
        headers.set("Content-Type", type);
        if (init.headers) {
            for (const key in init.headers) {
                const value = init.headers[key];
                if (!value)
                    continue;
                if (key.toLowerCase() === "set-cookie") {
                    headers.append(key, value);
                }
                else {
                    headers.set(key, value);
                }
            }
        }
        return new Response(body, {
            status: init.status ?? this.#status,
            statusText: init.statusText,
            headers,
        });
    }
    newResponse(body, init = {}) {
        const headers = new Headers(this.#headers);
        if (init.headers) {
            for (const key in init.headers) {
                const value = init.headers[key];
                if (!value) {
                    continue;
                }
                if (key.toLowerCase() === "set-cookie") {
                    headers.append(key, value);
                }
                else {
                    headers.set(key, value);
                }
            }
        }
        return new Response(body, {
            status: init.status ?? this.#status,
            statusText: init.statusText,
            headers,
        });
    }
    text(content, init) {
        return this.#newResponse(content, "text/plain; charset=utf-8", init);
    }
    html(strings, ...args) {
        return this.#newResponse(toString(strings, args), "text/html; charset=utf-8", args?.[0]);
    }
    xml(strings, ...args) {
        return this.#newResponse(toString(strings, args), "text/html; charset=utf-8", args?.[0]);
    }
    json(json, init) {
        return this.#newResponse(JSON.stringify(json), "application/json; charset=utf-8", init);
    }
    send(body, init) {
        let { body: _body, type } = determineContentTypeBody(body);
        const contentType = init?.headers?.["Content-Type"] ??
            init?.headers?.["content-type"] ??
            type;
        return this.#newResponse(_body, contentType, init);
    }
    redirect(url, status = 302) {
        const headers = new Headers(this.#headers);
        headers.set("Location", url);
        return new Response(null, { status, headers });
    }
    async download(filePath, filename) {
        if (!(await fileExists(filePath)))
            throw Error("File not found");
        const buf = await getFileBuffer(filePath);
        const headers = {
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": buf.byteLength.toString(),
        };
        return this.#newResponse(buf, "application/octet-stream", {
            status: this.#status,
            headers,
        });
    }
    async sendFile(filePath, init) {
        if (!(await fileExists(filePath)))
            throw Error("File not found");
        let size = await fileSize(filePath);
        const ext = extensionExtract(filePath);
        const mimeType = mimeTypes[ext] ?? defaultMimeType;
        let fileStream = await readStream(filePath);
        let headers = {
            "Content-Type": mimeType,
            "Content-Length": size.toString(),
            ...init?.headers,
        };
        let filename = init?.filename;
        if (filename) {
            headers["Content-Disposition"] = `attachment; filename="${filename}"`;
        }
        return this.newResponse(fileStream, {
            status: init?.status ?? this.#status,
            statusText: init?.statusText,
            headers,
        });
    }
    get args() {
        return this.#args;
    }
}
