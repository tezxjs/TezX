import { Middleware } from "../types/index.js";
/**
 * Options for HTTP Strict Transport Security (HSTS) header.
 */
export interface HstsOptions {
    /**
     * Max age in seconds for the `Strict-Transport-Security` header.
     * Example: 31536000 (1 year)
     */
    maxAge?: number;
    /**
     * Apply HSTS to subdomains by adding `includeSubDomains` directive.
     * Default: false
     */
    includeSubDomains?: boolean;
    /**
     * Add `preload` directive for browser preload lists.
     * Default: false
     */
    preload?: boolean;
    /**
     * Only apply HSTS on HTTPS requests.
     * If true, HTTP requests will not receive the HSTS header.
     * Default: false
     */
    hstsOnlyOnHttps?: boolean;
}
/**
 * Options for the secureHeaders middleware.
 */
export type SecureHeadersOptions = {
    /**
     * Built-in preset to use.
     * - "strict": strongest defaults for production.
     * - "balanced": reasonable defaults for most apps (report-only CSP by default).
     * - "dev": permissive settings useful for local development.
     *
     * @default "balanced"
     */
    preset?: "strict" | "balanced" | "dev";
    /**
     * HSTS (HTTP Strict Transport Security) options.
     * If provided, the middleware will set the `Strict-Transport-Security` header.
     *
     * @example
     * { maxAge: 31536000, includeSubDomains: true, preload: true }
     */
    hsts?: HstsOptions;
    /**
     * Value for `X-Frame-Options` header.
     * Common values: "DENY", "SAMEORIGIN".
     *
     * @default "SAMEORIGIN"
     */
    frameGuard?: "DENY" | "SAMEORIGIN" | string;
    /**
     * If true, sets `X-Content-Type-Options: nosniff`.
     *
     * @default true (depends on preset)
     */
    noSniff?: boolean;
    /**
     * If true, sets `X-XSS-Protection: 1; mode=block`.
     * Note: modern browsers use CSP; this header is legacy but harmless.
     *
     * @default true (depends on preset)
     */
    xssProtection?: boolean;
    /**
     * Value for `Referrer-Policy` header.
     * Examples: "no-referrer", "strict-origin-when-cross-origin".
     *
     * @default "no-referrer" (depends on preset)
     */
    referrerPolicy?: string;
    /**
     * Value for `Permissions-Policy` (formerly Feature-Policy).
     * Example: 'geolocation=(), microphone=()'
     *
     * @default '' (empty string = not set)
     */
    permissionsPolicy?: string;
    /**
     * Content Security Policy (CSP).
     * - Pass a raw header string to use it unchanged.
     * - Or pass an object mapping directives to sources (object will be prebuilt at init).
     *
     * Example object:
     * {
     *   "default-src": ["'self'"],
     *   "script-src": ["'self'", "https://cdn.example.com"]
     * }
     */
    csp?: string | Record<string, string | string[]>;
    /**
     * If true, send `Content-Security-Policy-Report-Only` instead of enforcement header.
     * Useful when first testing policies.
     *
     * @default false
     */
    cspReportOnly?: boolean;
    /**
     * If true, middleware will generate a per-request nonce (string) and inject it
     * into the `script-src` directive so inline scripts with that nonce are allowed.
     * Note: nonce generation allocates a small string per-request unless `ultraFastMode` is enabled.
     *
     * @default false
     */
    cspUseNonce?: boolean;
    /**
     * Ultra-fast mode disables per-request allocations (e.g., nonce generation).
     * Use this in high-QPS environments where inline scripts are not required.
     *
     * @default false
     */
    ultraFastMode?: boolean;
};
/**
 * secureHeaders middleware
*
* Precomputes static headers (HSTS, static CSP, X-Frame-Options, etc.) at
* middleware creation time. Optionally supports per-request CSP nonces
* (disabled in ultraFastMode).
 *
 * @template T,Path
 * @param {SecureHeadersOptions} [userOpts={}] - configuration overrides
 * @returns {Middleware<T,Path>} TezX-compatible middleware
*
* @example
* app.use(secureHeaders({ preset: 'strict', cspUseNonce: true }));
*/
export declare const secureHeaders: <T extends Record<string, any> = {}, Path extends string = any>(userOpts?: SecureHeadersOptions) => Middleware<T, Path>;
