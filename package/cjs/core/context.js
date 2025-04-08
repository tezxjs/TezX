"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = exports.httpStatusMap = void 0;
const environment_1 = require("./environment");
const header_1 = require("./header");
const request_1 = require("./request");
const state_1 = require("../utils/state");
const staticFile_1 = require("../utils/staticFile");
exports.httpStatusMap = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
};
class Context {
    #rawRequest;
    env = {};
    headers = new header_1.HeadersParser();
    res;
    pathname;
    url;
    method;
    #status = 200;
    state = new state_1.State();
    #params = {};
    #resBody;
    #localAddress = {};
    #remoteAddress = {};
    constructor(req, connInfo) {
        this.#rawRequest = req;
        this.#remoteAddress = connInfo.remoteAddr;
        this.#localAddress = connInfo.localAddr;
        this.method = req?.method?.toUpperCase();
        this.pathname = this.req.urlRef.pathname;
        this.url = this.req.url;
    }
    header(key, value) {
        this.headers.set(key, value);
        return this;
    }
    get cookies() {
        const c = this.req.headers.getAll("cookie");
        let cookies = {};
        if (Array.isArray(c) && c.length != 0) {
            const cookieHeader = c.join("; ").split(";");
            for (const pair of cookieHeader) {
                const [key, value] = pair?.trim()?.split("=");
                cookies[key] = decodeURIComponent(value);
            }
        }
        else if (typeof c == "string") {
            const cookieHeader = c.split(";");
            for (const pair of cookieHeader) {
                const [key, value] = pair?.trim()?.split("=");
                cookies[key] = decodeURIComponent(value);
            }
        }
        return {
            get: (cookie) => {
                return cookies?.[cookie];
            },
            all: () => {
                return cookies;
            },
            delete: (name, options) => {
                const value = "";
                const cookieOptions = {
                    ...options,
                    expires: new Date(0),
                };
                const cookieHeader = `${name}=${value};${serializeOptions(cookieOptions)}`;
                this.headers.set("Set-Cookie", cookieHeader);
            },
            set: (name, value, options) => {
                const cookieHeader = `${name}=${value};${serializeOptions(options || {})}`;
                this.headers.set("Set-Cookie", cookieHeader);
            },
        };
    }
    json(body, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "application/json; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(JSON.stringify(body), {
            status: status,
            headers: headers,
        });
    }
    send(body, ...args) {
        let status = this.#status;
        let headers = {};
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = args[1];
            }
        }
        else if (typeof args[0] === "object") {
            headers = args[0];
        }
        if (!headers["Content-Type"] && !headers["content-type"]) {
            if (typeof body === "string" || typeof body == "number") {
                headers["Content-Type"] = "text/plain;";
            }
            else if (typeof body === "object" && body !== null) {
                headers["Content-Type"] = "application/json;";
                body = JSON.stringify(body);
            }
            else {
                headers["Content-Type"] = "application/octet-stream";
            }
        }
        return this.#handleResponse(body, {
            status: status,
            headers,
        });
    }
    html(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "text/html; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    text(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "text/plain; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    xml(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "application/xml; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    status = (status) => {
        this.#status = status;
        return this;
    };
    set setStatus(status) {
        this.#status = status;
    }
    get getStatus() {
        return this.#status;
    }
    redirect(url, status = 302) {
        return new Response(null, {
            status: status,
            headers: { Location: url },
        });
    }
    async download(filePath, fileName) {
        try {
            let fileExists = false;
            const runtime = environment_1.EnvironmentDetector.getEnvironment;
            if (runtime === "node") {
                const { existsSync } = await Promise.resolve().then(() => require("fs"));
                fileExists = existsSync(filePath);
            }
            else if (runtime === "bun") {
                fileExists = Bun.file(filePath).exists();
            }
            else if (runtime === "deno") {
                try {
                    await Deno.stat(filePath);
                    fileExists = true;
                }
                catch {
                    fileExists = false;
                }
            }
            if (!fileExists) {
                throw Error("File not found");
            }
            let fileBuffer;
            if (runtime === "node") {
                const { readFileSync } = await Promise.resolve().then(() => require("fs"));
                fileBuffer = await readFileSync(filePath);
            }
            else if (runtime === "bun") {
                fileBuffer = await Bun.file(filePath)
                    .arrayBuffer()
                    .then((buf) => new Uint8Array(buf));
            }
            else if (runtime === "deno") {
                fileBuffer = await Deno.readFile(filePath);
            }
            return this.#handleResponse(fileBuffer, {
                status: 200,
                headers: {
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                    "Content-Type": "application/octet-stream",
                    "Content-Length": fileBuffer.byteLength.toString(),
                },
            });
        }
        catch (error) {
            throw Error("Internal Server Error" + error?.message);
        }
    }
    async sendFile(filePath, ...args) {
        try {
            const runtime = environment_1.EnvironmentDetector.getEnvironment;
            const resolvedPath = filePath;
            let fileExists = false;
            if (runtime === "node") {
                const { existsSync } = await Promise.resolve().then(() => require("fs"));
                fileExists = existsSync(resolvedPath);
            }
            else if (runtime === "bun") {
                fileExists = Bun.file(resolvedPath).exists();
            }
            else if (runtime === "deno") {
                try {
                    await Deno.stat(resolvedPath);
                    fileExists = true;
                }
                catch {
                    fileExists = false;
                }
            }
            if (!fileExists) {
                throw Error("File not found");
            }
            let fileSize = 0;
            if (runtime === "node") {
                const { statSync } = await Promise.resolve().then(() => require("fs"));
                fileSize = statSync(resolvedPath).size;
            }
            else if (runtime === "bun") {
                fileSize = (await Bun.file(resolvedPath).arrayBuffer()).byteLength;
            }
            else if (runtime === "deno") {
                const fileInfo = await Deno.stat(resolvedPath);
                fileSize = fileInfo.size;
            }
            const ext = filePath.split(".").pop()?.toLowerCase() || "";
            const mimeType = staticFile_1.mimeTypes[ext] || staticFile_1.defaultMimeType;
            let fileStream;
            if (runtime === "node") {
                const { createReadStream } = await Promise.resolve().then(() => require("fs"));
                fileStream = createReadStream(resolvedPath);
            }
            else if (runtime === "bun") {
                fileStream = Bun.file(resolvedPath).stream();
            }
            else if (runtime === "deno") {
                const file = await Deno.open(resolvedPath, { read: true });
                fileStream = file.readable;
            }
            let headers = {
                "Content-Type": mimeType,
                "Content-Length": fileSize.toString(),
            };
            let fileName = "";
            if (typeof args[0] === "string") {
                fileName = args[0];
                if (typeof args[1] === "object") {
                    headers = { ...headers, ...args[1] };
                }
            }
            else if (typeof args[0] === "object") {
                headers = { ...headers, ...args[0] };
            }
            if (fileName) {
                headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
            }
            return this.#handleResponse(fileStream, {
                status: 200,
                headers,
            });
        }
        catch (error) {
            throw Error("Internal Server Error" + error?.message);
        }
    }
    #handleResponse(body, { headers, status }) {
        let response = new Response(body, {
            status: status,
            headers,
        });
        let clone = response.clone();
        this.body = body;
        this.res = response;
        return clone;
    }
    get req() {
        return new request_1.Request(this.#rawRequest, this.params, this.#remoteAddress);
    }
    set params(params) {
        this.#params = params;
    }
    set body(body) {
        this.#resBody = body;
    }
    get body() {
        return this.#resBody;
    }
    get params() {
        return this.#params;
    }
}
exports.Context = Context;
function serializeOptions(options) {
    const parts = [];
    if (options.maxAge) {
        parts.push(`Max-Age=${options.maxAge}`);
    }
    if (options.expires) {
        parts.push(`Expires=${options.expires.toUTCString()}`);
    }
    if (options.path) {
        parts.push(`Path=${options.path}`);
    }
    if (options.domain) {
        parts.push(`Domain=${options.domain}`);
    }
    if (options.secure) {
        parts.push(`Secure`);
    }
    if (options.httpOnly) {
        parts.push(`HttpOnly`);
    }
    if (options.sameSite) {
        parts.push(`SameSite=${options.sameSite}`);
    }
    return parts.join("; ");
}
