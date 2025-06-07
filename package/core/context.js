import { State } from "../utils/state.js";
import { defaultMimeType, mimeTypes } from "../utils/staticFile.js";
import { urlParse } from "../utils/url.js";
import { GlobalConfig } from "./config.js";
import { EnvironmentDetector } from "./environment.js";
import { HeadersParser } from "./header.js";
import { Request } from "./request.js";
export const httpStatusMap = {
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
export class Context {
    #rawRequest;
    env = {};
    headers = new HeadersParser();
    pathname;
    url;
    method;
    #status = 200;
    state = new State();
    #params = {};
    resBody;
    #body;
    #urlRef;
    #requestHeaders;
    #options;
    constructor(req, options) {
        this.#options = options;
        this.#rawRequest = req;
        this.method = req?.method?.toUpperCase();
        this.#requestHeaders = new HeadersParser(req?.headers);
        if (GlobalConfig.adapter == "node") {
            let encrypted = req?.socket?.encrypted;
            const protocol = typeof encrypted === "boolean"
                ? encrypted
                    ? "https"
                    : "http"
                : "http";
            const host = EnvironmentDetector.getHost(this.#requestHeaders);
            const path = req.url || "/";
            this.url = `${protocol}://${host}${path}`;
        }
        else {
            this.url = req.url;
        }
        this.#urlRef = urlParse(this.url);
        this.pathname = this.#urlRef.pathname;
    }
    header(key, value, options) {
        let append = options?.append;
        if (append) {
            this.headers.append(key, value);
        }
        else {
            this.headers.set(key, value);
        }
        return this;
    }
    get cookies() {
        const c = this.#requestHeaders.getAll("cookie");
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
    html(strings, ...args) {
        let status = this.#status;
        let data = strings;
        if (Array.isArray(strings)) {
            data = strings.reduce((result, str, i) => {
                const value = args?.[i] ?? "";
                return result + str + value;
            }, "");
        }
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
            const runtime = EnvironmentDetector.getEnvironment;
            if (runtime === "node") {
                const { existsSync } = await import("node:fs");
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
                const { readFileSync } = await import("node:fs");
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
            const runtime = EnvironmentDetector.getEnvironment;
            const resolvedPath = filePath;
            let fileExists = false;
            if (runtime === "node") {
                const { existsSync } = await import("node:fs");
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
                const { statSync } = await import("node:fs");
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
            const mimeType = mimeTypes[ext] || defaultMimeType;
            let fileStream;
            if (runtime === "node") {
                const { createReadStream } = await import("node:fs");
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
        this.resBody = body;
        return response;
    }
    get req() {
        return new Request({
            headers: this.#requestHeaders,
            req: this.#rawRequest,
            urlRef: this.#urlRef,
            options: this.#options,
            params: this.#params,
        });
    }
    set params(params) {
        this.#params = params;
    }
    set body(body) {
        this.#body = body;
    }
    get body() {
        return this.#body;
    }
    get params() {
        return this.#params;
    }
}
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
