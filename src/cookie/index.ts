import { Context } from "../index.js";
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
export function getCookie(ctx: Context, name: string): string | undefined {
  return allCookies(ctx)?.[name];
}

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
export function allCookies(ctx: Context): Record<string, string> {
  const cookieHeader = ctx.req.header("cookie");
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  let start = 0;
  let sep = -1;
  const len = cookieHeader.length;

  for (let i = 0; i <= len; i++) {
    const ch = cookieHeader.charCodeAt(i) || 59; // 59 = ';'
    if (ch === 61 && sep === -1) {
      // '='
      sep = i;
    } else if (ch === 59 || i === len) {
      // ';'
      if (sep > -1) {
        const key = cookieHeader.slice(start, sep).trim();
        const value = cookieHeader.slice(sep + 1, i).trim();
        cookies[key] = decodeURIComponent(value);
      }
      start = i + 1;
      sep = -1;
    }
  }
  ctx.cookies = cookies;
  return cookies;
}

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
export function setCookie(
  ctx: Context,
  name: string,
  value: string,
  options?: CookieOptions,
) {
  ctx.setHeader(
    "Set-Cookie",
    `${name}=${value}; ${serializeOptions(options ?? {})}`,
  );
}

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
export function deleteCookie(
  ctx: Context,
  name: string,
  options?: CookieOptions,
) {
  ctx.setHeader(
    "Set-Cookie",
    `${name}=; ${serializeOptions({ ...options, maxAge: 0, expires: new Date(0) })}`,
  );
}

/**
 * Serialize cookie options to a string suitable for the "Set-Cookie" header.
 *
 * @param {CookieOptions} options - The cookie options.
 * @returns {string} The serialized cookie options.
 *
 * @example
 * ```ts
 * serializeOptions({ maxAge: 3600, httpOnly: true });
 * // returns "Max-Age=3600; HttpOnly"
 * ```
 */
function serializeOptions(options: CookieOptions): string {
  const parts: string[] = [];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.secure) parts.push(`Secure`);
  if (options.httpOnly) parts.push(`HttpOnly`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}
