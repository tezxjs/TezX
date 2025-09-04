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
        this.#headers = (header || {});
    }
    setHeader(key, value, options) {
        let _key = key.toLowerCase();
        let append = options?.append || _key == 'set-cookie';
        if (!this.res) {
            if (append && this.#headers[_key]) {
                this.#headers[_key] += `, ${value}`;
            }
            else {
                this.#headers[_key] = value;
            }
        }
        else {
            const resHeaders = this.res.headers;
            if (append) {
                resHeaders.append(_key, value);
            }
            else {
                resHeaders.set(_key, value);
            }
        }
        return this;
    }
    deleteHeader(key) {
        const _key = key.toLowerCase();
        if (!this.res) {
            delete this.#headers[_key];
        }
        else {
            this.res.headers.delete(_key);
        }
        return this;
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
    newResponse(body, init = {}) {
        const headers = { ...this.#headers, ...init.headers };
        const status = init.status || this.#status;
        const statusText = init.statusText;
        return new Response(body, { status, statusText, headers: headers });
    }
    text(content, init) {
        return (0, response_js_1.newResponse)(content, "text/plain; charset=utf-8", init, this.#headers, this.#status);
    }
    html(strings, ...args) {
        let html = strings;
        if (Array.isArray(strings)) {
            html = strings.reduce((result, str, i) => {
                const value = args?.[i] ?? "";
                return result + str + value;
            }, "");
            return (0, response_js_1.newResponse)(html, "text/html; charset=utf-8", {}, this.#headers, this.#status);
        }
        else {
            let init = args?.[0];
            return (0, response_js_1.newResponse)(html, "text/html; charset=utf-8", init, this.#headers, this.#status);
        }
    }
    xml(xml, init) {
        return (0, response_js_1.newResponse)(xml, "text/xml; charset=utf-8", init, this.#headers, this.#status);
    }
    json(json, init) {
        return (0, response_js_1.newResponse)(JSON.stringify(json), "application/json; charset=utf-8", init, this.#headers, this.#status);
    }
    send(body, init) {
        let { body: _body, type } = (0, response_js_1.determineContentTypeBody)(body);
        const contentType = init?.headers?.["Content-Type"] ||
            init?.headers?.["content-type"] ||
            type;
        return (0, response_js_1.newResponse)(_body, contentType, {}, this.#headers, this.#status);
    }
    redirect(url, status = 302) {
        return new Response(null, {
            status: status,
            headers: { ...this.#headers, Location: url },
        });
    }
    async download(filePath, filename) {
        if (!(await (0, file_js_1.fileExists)(filePath)))
            throw Error("File not found");
        let buf = await (0, file_js_1.getFileBuffer)(filePath);
        return (0, response_js_1.newResponse)(buf, "application/octet-stream", {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": buf.byteLength.toString(),
            }
        }, this.#headers, this.#status);
    }
    async sendFile(filePath, init) {
        if (!(await (0, file_js_1.fileExists)(filePath)))
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
        return this.newResponse(fileStream, {
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
