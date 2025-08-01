import { Context } from "../core/context.js";
import { CookieOptions } from "../types/index.js";
/**
 * Get the value of a specific cookie by name from the request context.
 *
 * @param {Context} ctx - The context containing the request.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | undefined} The cookie value if found, otherwise undefined.
 *
 * @example
 * ```ts
 * const sessionId = getCookie(ctx,"session_id");
 * ```
 */
export declare function getCookie(ctx: Context, name: string): string | undefined;
/**
 * Parse all cookies from the request's "cookie" header into an object.
 *
 * @param {Context} ctx - The context containing the request.
 * @returns {Record<string, string>} An object mapping cookie names to their decoded values.
 *
 * @example
 * ```ts
 * const cookies = allCookies(ctx);
 * console.log(cookies["session_id"]);
 * ```
 */
export declare function allCookies(ctx: Context): Record<string, string>;
/**
 * Set a cookie in the response headers.
 *
 * @param {Context} ctx - The context containing the response.
 * @param {string} name - The name of the cookie to set.
 * @param {string} value - The cookie value.
 * @param {CookieOptions} [options] - Optional cookie settings like `maxAge`, `path`, `secure`, etc.
 *
 * @example
 * ```ts
 * setCookie(ctx, "session_id", "abc123", { httpOnly: true, maxAge: 3600 });
 * ```
 */
export declare function setCookie(ctx: Context, name: string, value: string, options?: CookieOptions): void;
/**
 * Delete a cookie by setting its expiration date in the past.
 *
 * @param {Context} ctx - The context containing the response.
 * @param {string} name - The name of the cookie to delete.
 * @param {CookieOptions} [options] - Optional settings such as `path` to ensure proper deletion.
 *
 * @example
 * ```ts
 * deleteCookie(ctx, "session_id");
 * ```
 */
export declare function deleteCookie(ctx: Context, name: string, options?: CookieOptions): void;
