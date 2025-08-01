"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const file_js_1 = require("../utils/file.js");
const low_level_js_1 = require("../utils/low-level.js");
const response_js_1 = require("../utils/response.js");
const mimeTypes_js_1 = require("../utils/mimeTypes.js");
const request_js_1 = require("./request.js");
class Context {
    #status = 200;
    #headers = { connection: "keep-alive" };
    #req = null;
    #params = {};
    rawRequest;
    #args;
    #body;
    env = {};
    pathname;
    method;
    constructor(req, options) {
        this.#args = options?.args;
        this.rawRequest = req;
        this.pathname = options?.pathname;
        this.env = options?.env || {};
        this.method = options?.method;
    }
    get url() {
        return this.req.url;
    }
    get getStatus() {
        return this.#status;
    }
    set setStatus(code) {
        this.#status = code;
    }
    header(header) {
        if (header) {
            return this.#headers[header?.toLowerCase()];
        }
        return this.#headers;
    }
    set clearHeader(header) {
        this.#headers = header || {};
    }
    setHeader(key, value, options) {
        let _key = key.toLowerCase();
        if (!this.res) {
            if (options?.append && this.#headers[_key]) {
                this.#headers[_key] += `, ${value}`;
            }
            else {
                this.#headers[_key] = value;
            }
        }
        else {
            const resHeaders = this.res.headers;
            if (options?.append) {
                resHeaders.append(_key, value);
            }
            else {
                resHeaders.set(_key, value);
            }
        }
        return this;
    }
    get params() {
        return this.#params;
    }
    set params(params) {
        this.#params = params;
    }
    get req() {
        if (!this.#req) {
            this.#req = new request_js_1.TezXRequest(this.rawRequest, this.method, this.pathname, this.#params);
        }
        return this.#req;
    }
    get body() { return this.#body; }
    set body(value) { this.#body = value; }
    status = (status) => {
        this.#status = status;
        return this;
    };
    createResponse(body, init = {}) {
        const headers = { ...this.#headers, ...init.headers };
        const status = init.status || this.#status;
        const statusText = init.statusText;
        return new Response(body, { status, statusText, headers });
    }
    text(content, init) {
        return this.createResponse(content, {
            ...init,
            headers: { "Content-Type": "text/plain; charset=utf-8", ...init?.headers }
        });
    }
    html(strings, ...args) {
        let html = strings;
        if (Array.isArray(strings)) {
            html = strings.reduce((result, str, i) => {
                const value = args?.[i] ?? "";
                return result + str + value;
            }, "");
            return this.createResponse(html, {
                headers: { "Content-Type": "text/html; charset=utf-8" }
            });
        }
        else {
            let init = args?.[0];
            return this.createResponse(html, {
                ...init,
                headers: { "Content-Type": "text/html; charset=utf-8", ...init?.headers }
            });
        }
    }
    xml(xml, init) {
        return this.createResponse(xml, {
            ...init,
            headers: { "Content-Type": "application/xml; charset=utf-8", ...init?.headers }
        });
    }
    json(json, init) {
        return this.createResponse(JSON.stringify(json), {
            ...init,
            headers: { "Content-Type": "application/json; charset=utf-8", ...init?.headers }
        });
    }
    send(body, init) {
        let { body: _body, type } = (0, response_js_1.determineContentTypeBody)(body);
        const contentType = init?.headers?.["Content-Type"] || init?.headers?.["content-type"] || type;
        return this.createResponse(_body, {
            ...init,
            headers: { "Content-Type": contentType, ...init?.headers }
        });
    }
    redirect(url, status = 302) {
        return new Response(null, {
            status: status,
            headers: { Location: url },
        });
    }
    async download(filePath, filename) {
        if (!await (0, file_js_1.fileExists)(filePath))
            throw Error("File not found");
        let buf = await (0, file_js_1.getFileBuffer)(filePath);
        return this.createResponse(buf, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Type": "application/octet-stream",
                "Content-Length": buf.byteLength.toString(),
            },
        });
    }
    async sendFile(filePath, init) {
        if (!await (0, file_js_1.fileExists)(filePath))
            throw Error("File not found");
        let size = await (0, file_js_1.fileSize)(filePath);
        const ext = (0, low_level_js_1.extensionExtract)(filePath) || "";
        const mimeType = mimeTypes_js_1.mimeTypes[ext] || mimeTypes_js_1.defaultMimeType;
        let fileStream = await (0, file_js_1.readStream)(filePath);
        let headers = {
            "Content-Type": mimeType,
            "Content-Length": size.toString(),
            ...init?.headers,
        };
        let filename = init?.filename;
        if (filename)
            headers["Content-Disposition"] = `attachment; filename="${filename}"`;
        return this.createResponse(fileStream, {
            status: init?.status || 200,
            statusText: init?.statusText,
            headers,
        });
    }
    get args() {
        return this.#args;
    }
}
exports.Context = Context;
