"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = getCookie;
exports.allCookies = allCookies;
exports.setCookie = setCookie;
exports.deleteCookie = deleteCookie;
function getCookie(ctx, name) {
    return allCookies(ctx)?.[name];
}
function allCookies(ctx) {
    const cookieHeader = ctx.req.header("cookie");
    const cookies = {};
    if (!cookieHeader)
        return cookies;
    let start = 0;
    let sep = -1;
    const len = cookieHeader.length;
    for (let i = 0; i <= len; i++) {
        const ch = cookieHeader.charCodeAt(i) || 59;
        if (ch === 61 && sep === -1) {
            sep = i;
        }
        else if (ch === 59 || i === len) {
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
function setCookie(ctx, name, value, options) {
    ctx.setHeader("Set-Cookie", `${name}=${value}; ${serializeOptions(options ?? {})}`);
}
function deleteCookie(ctx, name, options) {
    ctx.setHeader("Set-Cookie", `${name}=; ${serializeOptions({ ...options, maxAge: 0, expires: new Date(0) })}`);
}
function serializeOptions(options) {
    const parts = [];
    if (options.maxAge)
        parts.push(`Max-Age=${options.maxAge}`);
    if (options.expires)
        parts.push(`Expires=${options.expires.toUTCString()}`);
    if (options.path)
        parts.push(`Path=${options.path}`);
    if (options.domain)
        parts.push(`Domain=${options.domain}`);
    if (options.secure)
        parts.push(`Secure`);
    if (options.httpOnly)
        parts.push(`HttpOnly`);
    if (options.sameSite)
        parts.push(`SameSite=${options.sameSite}`);
    return parts.join("; ");
}
