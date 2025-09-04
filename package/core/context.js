import { fileExists, fileSize, getFileBuffer, readStream, } from "../utils/file.js";
import { extensionExtract } from "../utils/low-level.js";
import { defaultMimeType, mimeTypes } from "../utils/mimeTypes.js";
import { determineContentTypeBody, newResponse } from "../utils/response.js";
import { TezXRequest } from "./request.js";
export class Context {
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
            this.#req = new TezXRequest(this.rawRequest, this.method, this.pathname, this.#params);
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
        return newResponse(content, "text/plain; charset=utf-8", init, this.#headers, this.#status);
    }
    html(strings, ...args) {
        let html = strings;
        if (Array.isArray(strings)) {
            html = strings.reduce((result, str, i) => {
                const value = args?.[i] ?? "";
                return result + str + value;
            }, "");
            return newResponse(html, "text/html; charset=utf-8", {}, this.#headers, this.#status);
        }
        else {
            let init = args?.[0];
            return newResponse(html, "text/html; charset=utf-8", init, this.#headers, this.#status);
        }
    }
    xml(xml, init) {
        return newResponse(xml, "text/xml; charset=utf-8", init, this.#headers, this.#status);
    }
    json(json, init) {
        return newResponse(JSON.stringify(json), "application/json; charset=utf-8", init, this.#headers, this.#status);
    }
    send(body, init) {
        let { body: _body, type } = determineContentTypeBody(body);
        const contentType = init?.headers?.["Content-Type"] ||
            init?.headers?.["content-type"] ||
            type;
        return newResponse(_body, contentType, {}, this.#headers, this.#status);
    }
    redirect(url, status = 302) {
        return new Response(null, {
            status: status,
            headers: { ...this.#headers, Location: url },
        });
    }
    async download(filePath, filename) {
        if (!(await fileExists(filePath)))
            throw Error("File not found");
        let buf = await getFileBuffer(filePath);
        return newResponse(buf, "application/octet-stream", {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": buf.byteLength.toString(),
            }
        }, this.#headers, this.#status);
    }
    async sendFile(filePath, init) {
        if (!(await fileExists(filePath)))
            throw Error("File not found");
        let size = await fileSize(filePath);
        const ext = extensionExtract(filePath) || "";
        const mimeType = mimeTypes[ext] || defaultMimeType;
        let fileStream = await readStream(filePath);
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
