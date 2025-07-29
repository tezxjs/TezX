import { GlobalConfig } from "../../core/config.js";
import { Middleware } from "../../types/index.js";

export type SanitizeHeadersOptions = {
    /**
     * 🟢 Whitelist of allowed headers (case-insensitive)
     * @default [] (allow all if empty)
     * @example
     * whitelist: ['content-type', 'authorization'] // Only allow these headers
     */
    whitelist?: string[];

    /**
     * 🔴 Blacklist of disallowed headers (case-insensitive)
     * @default [] (block none if empty)
     * @example
     * blacklist: ['x-powered-by', 'server'] // Block server info headers
     */
    blacklist?: string[];

    /**
     * 🔵 Normalize header keys to lowercase
     * @default true
     * @example
     * normalizeKeys: false // Preserve original header case
     */
    normalizeKeys?: boolean;

    /**
     * 🟠 Allow potentially unsafe characters in header values
     * @default false
     * @warning Enabling this may reduce security
     * @example
     * allowUnsafeCharacters: true // Allow CR/LF in headers
     */
    allowUnsafeCharacters?: boolean;
};

/**
 * 🧼 Middleware to sanitize HTTP headers for security and compliance
 *
 * Removes dangerous headers, enforces allow/block lists, and normalizes headers.
 * Protects against header injection and information leakage.
 *
 * @param {SanitizeHeadersOptions} [options={}] - Configuration options
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic usage with defaults
 * app.use(sanitizeHeaders());
 *
 * // Strict configuration
 * app.use(sanitizeHeaders({
 *   whitelist: ['accept', 'content-type'],
 *   normalizeKeys: true
 * }));
 */
const sanitizeHeaders = (
    options: SanitizeHeadersOptions = {},
): Middleware => {
    // Destructure with defaults
    const {
        whitelist = [],
        blacklist = [],
        normalizeKeys = true,
        allowUnsafeCharacters = false,
    } = options;

    return async function sanitizeHeaders(ctx, next) {
        const sanitizedHeaders: Map<string, string> = new Map();

        // 🔄 Process each header entry
        for (const [key, values] of ctx.headers.entries()) {
            if (!Array.isArray(values) || values.length === 0) {
                continue; // Skip empty or malformed headers
            }

            // 🔠 Normalize header key if enabled
            const normalizedKey = normalizeKeys ? key.toLowerCase() : key;

            // ⚖️ Check against security lists
            if (
                whitelist.length > 0 &&
                !whitelist.some((r) => r?.toLowerCase() === normalizedKey)
            ) {
                GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" not in whitelist - removed`,);
                continue;
            }
            if (blacklist.some((r) => r.toLowerCase() === normalizedKey)) {
                GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" in blacklist - removed`,);
                continue;
            }

            // 🛡️ Validate header name format
            if (!isValidHeaderName(normalizedKey)) {
                GlobalConfig.debugging.warn(
                    `⚠️ Invalid header name: "${normalizedKey}" - removed`,
                );
                continue;
            }

            // 🧹 Sanitize each header value
            const sanitizedValues = values
                .map((value) => sanitizeHeaderValue(value, allowUnsafeCharacters))
                .filter(Boolean); // Remove empty values

            if (sanitizedValues.length === 0) {
                GlobalConfig.debugging.warn(
                    `⚠️ All values for "${normalizedKey}" invalid - removed`,
                );
                continue;
            }
            // ✅ Add sanitized header to new collection
            sanitizedHeaders.set(normalizedKey, sanitizedValues?.join(", "));
        }

        // 🔄 Replace original headers with sanitized versions

        ctx.headers = new Headers(sanitizedHeaders as any);

        // ⏭️ Proceed to next middleware
        return await next();
    };
};

/**
 * 🔍 Validates header name against RFC 7230 standards
 * @param name - Header name to validate
 * @returns True if valid header name format
 *
 * @private
 */
const isValidHeaderName = (name: string): boolean => {
    const HEADER_NAME_REGEX = /^[a-zA-Z0-9\-_]+$/;
    return HEADER_NAME_REGEX.test(name);
};

/**
 * 🧽 Sanitizes header value by removing dangerous sequences
 * @param value - Original header value
 * @param allowUnsafeCharacters - Whether to permit risky chars
 * @returns Sanitized value or empty string if invalid
 *
 * @private
 */
const sanitizeHeaderValue = (
    value: string,
    allowUnsafeCharacters: boolean,
): string => {
    let sanitized = value.trim();

    if (!allowUnsafeCharacters) {
        // Remove CRLF sequences and control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
    }

    return sanitized;
};

export {
    sanitizeHeaders, sanitizeHeaders as default,
}