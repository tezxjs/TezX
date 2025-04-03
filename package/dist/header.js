export class HeadersParser {
    constructor(init) {
        this.headers = new Map(); // Lowercase keys for case-insensitivity
        if (init) {
            this.add(init);
        }
    }
    /**
     * Adds multiple headers to the parser.
     * @param headers - Headers as an array of tuples or a record object.
     */
    add(headers) {
        if (Array.isArray(headers)) {
            for (const [key, value] of headers) {
                this.set(key, value);
            }
        }
        else if (typeof Headers !== "undefined" && headers instanceof Headers) {
            for (const [key, value] of headers.entries()) {
                this.set(key, value);
            }
        }
        else if (typeof headers === "object") {
            for (const key in headers) {
                if (Object.prototype.hasOwnProperty.call(headers, key)) {
                    this.set(key, headers[key]);
                }
            }
        }
        return this;
    }
    /**
     * Sets a header value.
     * @param key - Header name.
     * @param value - Header value(s).
     */
    set(key, value) {
        this.headers.set(key.toLowerCase(), Array.isArray(value) ? value : [value]);
        return this;
    }
    clear() {
        this.headers.clear();
        return this;
    }
    /**
     * Retrieves the first value of a header.
     * @param key - Header name.
     * @returns The first header value or undefined if not found.
     */
    get(key) {
        const values = this.headers.get(key.toLowerCase());
        return values ? values[0] : undefined;
    }
    /**
     * Retrieves all values of a header.
     * @param key - Header name.
     * @returns An array of header values.
     */
    getAll(key) {
        return this.headers.get(key.toLowerCase()) || [];
    }
    /**
     * Checks if a header exists.
     * @param key - Header name.
     * @returns True if the header exists, false otherwise.
     */
    has(key) {
        return this.headers.has(key.toLowerCase());
    }
    /**
     * Deletes a header.
     * @param key - Header name.
     * @returns True if deleted successfully, false otherwise.
     */
    delete(key) {
        return this.headers.delete(key.toLowerCase());
    }
    /**
     * Appends a value to an existing header or creates a new one.
     * @param key - Header name.
     * @param value - Value to append.
     */
    append(key, value) {
        const lowerKey = key.toLowerCase();
        if (this.headers.has(lowerKey)) {
            this.headers.get(lowerKey).push(value);
        }
        else {
            this.headers.set(lowerKey, [value]);
        }
        return this;
    }
    /**
     * Returns an iterator over header entries.
     * @returns IterableIterator of header key-value pairs.
     */
    entries() {
        return this.headers.entries();
    }
    /**
     * Returns an iterator over header keys.
     * @returns IterableIterator of header names.
     */
    keys() {
        return this.headers.keys();
    }
    /**
     * Returns an iterator over header values.
     * @returns IterableIterator of header values arrays.
     */
    values() {
        return this.headers.values();
    }
    /**
     * Iterates over headers and executes a callback function.
     * @param callback - Function to execute for each header.
     */
    forEach(callback) {
        for (const [key, value] of this.headers) {
            callback(value, key);
        }
    }
    /**
     * Converts headers into a plain object.
     * @returns A record of headers where single-value headers are returned as a string.
     */
    toObject() {
        const obj = {};
        for (const [key, value] of this.headers.entries()) {
            obj[key] = value.length > 1 ? value : value[0];
        }
        return obj;
    }
}
Object.defineProperty(HeadersParser, "name", { value: "Headers" });
