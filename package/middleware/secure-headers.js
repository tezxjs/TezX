import { generateRandomBase64, GlobalConfig } from "../helper/index.js";
const joinSrc = (v) => typeof v === "string" ? v : v.join(" ");
const buildCSPString = (cspObj) => {
    const parts = [];
    for (const key in cspObj)
        parts.push(`${key} ${joinSrc(cspObj[key])}`);
    return parts.join("; ");
};
export const secureHeaders = (userOpts = {}) => {
    const defaultPresets = {
        strict: {
            preset: "strict",
            hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
            frameGuard: "DENY",
            noSniff: true,
            xssProtection: true,
            referrerPolicy: "strict-origin-when-cross-origin",
            permissionsPolicy: "geolocation=(), microphone=(), camera=(), usb=()",
            csp: {
                "default-src": ["'self'"],
                "script-src": ["'self'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "data:", "blob:"],
                "font-src": ["'self'"],
                "connect-src": ["'self'"],
                "object-src": ["'none'"],
                "frame-ancestors": ["'none'"],
            },
            cspReportOnly: false,
        },
        balanced: {
            preset: "balanced",
            hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
            frameGuard: "SAMEORIGIN",
            noSniff: true,
            xssProtection: true,
            referrerPolicy: "no-referrer-when-downgrade",
            permissionsPolicy: "geolocation=(), microphone=()",
            csp: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "https://cdn.jsdelivr.net"],
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                ],
                "img-src": ["'self'", "data:", "https://images.example.com"],
                "connect-src": ["'self'", "https://api.example.com"],
            },
            cspReportOnly: true,
        },
        dev: {
            preset: "dev",
            hsts: undefined,
            frameGuard: "SAMEORIGIN",
            noSniff: false,
            xssProtection: false,
            referrerPolicy: "no-referrer",
            permissionsPolicy: "",
            csp: {
                "default-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "http://localhost:3000",
                ],
                "img-src": ["'self'", "data:", "blob:"],
            },
            cspReportOnly: true,
        },
    };
    const preset = userOpts.preset ?? "balanced";
    const base = {
        ...(defaultPresets[preset] || defaultPresets.balanced),
        ...userOpts,
    };
    const frameHeader = base.frameGuard || "SAMEORIGIN";
    const xssHeader = base.xssProtection ? "1; mode=block" : "0";
    const noSniffHeader = base.noSniff ? "nosniff" : "";
    const permissionsHeader = base.permissionsPolicy || "";
    const referrerHeader = base.referrerPolicy || "no-referrer";
    const hstsParts = [`max-age=${base.hsts?.maxAge || 31536000}`];
    if (base.hsts?.includeSubDomains)
        hstsParts.push("includeSubDomains");
    if (base.hsts?.preload)
        hstsParts.push("preload");
    const hstsHeader = hstsParts.join("; ");
    let cspStatic = null;
    let cspNeedsNonce = !!base.cspUseNonce;
    if (typeof base.csp === "string")
        cspStatic = base.csp;
    else if (base.csp)
        cspStatic = buildCSPString(base.csp);
    const cspReportOnly = !!base.cspReportOnly;
    const ultraFast = !!base.ultraFastMode;
    if (cspNeedsNonce && ultraFast) {
        GlobalConfig.debugging.warn("secureHeaders: ultraFastMode disables CSP nonce support. Nonce will not be used.");
    }
    if (ultraFast)
        cspNeedsNonce = false;
    return async (ctx, next) => {
        try {
            if (base.hsts) {
                const proto = (ctx.req?.header("x-forwarded-proto") || "").toString();
                if (!base.hsts.hstsOnlyOnHttps || proto.includes("https")) {
                    ctx.headers.set("Strict-Transport-Security", hstsHeader);
                }
            }
            ctx.headers.set("X-Frame-Options", frameHeader);
            ctx.headers.set("X-Content-Type-Options", noSniffHeader);
            ctx.headers.set("X-XSS-Protection", xssHeader);
            ctx.headers.set("Referrer-Policy", referrerHeader);
            if (permissionsHeader)
                ctx.headers.set("Permissions-Policy", permissionsHeader);
            if (cspNeedsNonce) {
                const nonce = generateRandomBase64();
                let cspHeader = cspStatic;
                if (!cspHeader) {
                    cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}'`;
                }
                if (typeof base.csp === "object") {
                    const idx = cspHeader.indexOf("script-src");
                    if (idx >= 0) {
                        const parts = [];
                        parts.push(cspHeader.slice(0, idx + 10));
                        parts.push(" 'nonce-" + nonce + "'");
                        parts.push(cspHeader.slice(idx + 10));
                        cspHeader = parts.join("");
                    }
                    else {
                        cspHeader += "; script-src 'self' 'nonce-" + nonce + "'";
                    }
                }
                ctx.cspNonce = nonce;
                if (cspReportOnly)
                    ctx.headers.set("Content-Security-Policy-Report-Only", cspHeader);
                else
                    ctx.headers.set("Content-Security-Policy", cspHeader);
            }
            else if (cspStatic) {
                if (cspReportOnly)
                    ctx.headers.set("Content-Security-Policy-Report-Only", cspStatic);
                else
                    ctx.headers.set("Content-Security-Policy", cspStatic);
            }
            return await next();
        }
        catch (err) {
            console.error("secureHeaders middleware error", err);
            return await next();
        }
    };
};
