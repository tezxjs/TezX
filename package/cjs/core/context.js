"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const file_js_1 = require("../utils/file.js");
const low_level_js_1 = require("../utils/low-level.js");
const mimeTypes_js_1 = require("../utils/mimeTypes.js");
const response_js_1 = require("../utils/response.js");
const request_js_1 = require("./request.js");
class Context {
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
        return (this.#req ??= new request_js_1.TezXRequest(this.rawRequest, this.method, this.pathname, this.#params));
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
        return this.#newResponse((0, response_js_1.toString)(strings, args), "text/html; charset=utf-8", args?.[0]);
    }
    xml(strings, ...args) {
        return this.#newResponse((0, response_js_1.toString)(strings, args), "text/html; charset=utf-8", args?.[0]);
    }
    json(json, init) {
        return this.#newResponse(JSON.stringify(json), "application/json; charset=utf-8", init);
    }
    send(body, init) {
        let { body: _body, type } = (0, response_js_1.determineContentTypeBody)(body);
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
        if (!(await (0, file_js_1.fileExists)(filePath)))
            throw Error("File not found");
        const buf = await (0, file_js_1.getFileBuffer)(filePath);
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
        if (!(await (0, file_js_1.fileExists)(filePath)))
            throw Error("File not found");
        let size = await (0, file_js_1.fileSize)(filePath);
        const ext = (0, low_level_js_1.extensionExtract)(filePath);
        const mimeType = mimeTypes_js_1.mimeTypes[ext] ?? mimeTypes_js_1.defaultMimeType;
        let fileStream = await (0, file_js_1.readStream)(filePath);
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
exports.Context = Context;
