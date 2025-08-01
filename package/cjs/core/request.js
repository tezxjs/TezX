"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezXRequest = void 0;
const url_js_1 = require("../utils/url.js");
class TezXRequest {
    url;
    method;
    pathname;
    #rawRequest;
    params = {};
    remoteAddress = {};
    #bodyConsumed = false;
    #rawBodyArrayBuffer;
    #cachedText;
    #cachedJSON;
    #cachedFormObject;
    #headersCache;
    #queryCache;
    constructor(req, method, pathname, params) {
        this.url = req.url || "";
        this.params = params || {};
        this.method = method;
        this.#rawRequest = req;
        this.pathname = pathname || "/";
    }
    header(header) {
        if (header) {
            return this.#rawRequest.headers.get(header?.toLowerCase());
        }
        if (this.#headersCache)
            return this.#headersCache;
        const obj = {};
        for (const [key, value] of this.#rawRequest.headers.entries()) {
            obj[key.toLowerCase()] = value;
        }
        this.#headersCache = obj;
        return this.#headersCache;
    }
    get query() {
        return this.#queryCache ??= (0, url_js_1.url2query)(this.url);
    }
    async #ensureRawBuffer() {
        if (this.#bodyConsumed)
            return;
        this.#rawBodyArrayBuffer = await this.#rawRequest.arrayBuffer();
        this.#bodyConsumed = true;
    }
    async text() {
        if (this.#cachedText !== undefined)
            return this.#cachedText;
        await this.#ensureRawBuffer();
        this.#cachedText = new TextDecoder().decode(this.#rawBodyArrayBuffer);
        return this.#cachedText;
    }
    get #contentType() {
        const ct = this.#rawRequest.headers.get("content-type");
        if (!ct)
            return "";
        return ct.split(";")[0].trim().toLowerCase();
    }
    async json() {
        if (this.#cachedJSON !== undefined)
            return this.#cachedJSON;
        if (this.#contentType !== "application/json")
            return {};
        try {
            if (!this.#bodyConsumed) {
                this.#cachedJSON = await this.#rawRequest.json();
                this.#bodyConsumed = true;
            }
            else {
                const txt = await this.text();
                this.#cachedJSON = txt ? JSON.parse(txt) : {};
            }
        }
        catch {
            this.#cachedJSON = {};
        }
        return this.#cachedJSON;
    }
    async formData() {
        if (this.#cachedFormObject)
            return this.#cachedFormObject;
        const ct = this.#contentType;
        if (!ct)
            throw new Error("Missing Content-Type");
        if (ct === "application/x-www-form-urlencoded" || ct === "multipart/form-data") {
            if (this.#bodyConsumed) {
                throw new Error("Multipart body already consumed elsewhere");
            }
            this.#cachedFormObject = await this.#rawRequest.formData();
            this.#bodyConsumed = true;
            return this.#cachedFormObject;
        }
        return this.#cachedFormObject;
    }
}
exports.TezXRequest = TezXRequest;
