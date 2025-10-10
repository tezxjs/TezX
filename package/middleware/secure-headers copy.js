import crypto from "crypto";
const joinSrc = (v) => typeof v === "string" ? v : v.join(" ");
const buildCSPString = (cspObj) => {
    const parts = [];
    for (const key in cspObj) {
        parts.push(`${key} ${joinSrc(cspObj[key])}`);
    }
    return parts.join("; ");
};
const defaultPresets = {
    strict: {
        preset: "strict",
        hsts: true,
        hstsMaxAge: 63072000,
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
        hsts: true,
        hstsMaxAge: 31536000,
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
        hsts: false,
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
const setHeader = (ctx, name, value) => {
    if (typeof ctx.setHeader === "function")
        ctx.setHeader(name, value);
    else if (ctx.response?.setHeader)
        ctx.response.setHeader(name, value);
    else if (ctx.headersOut)
        ctx.headersOut[name] = value;
};
export const secureHeaders = (userOpts = {}) => {
    const preset = userOpts.preset ?? "balanced";
    const base = {
        ...(defaultPresets[preset] || defaultPresets.balanced),
        ...userOpts,
    };
    const hstsHeader = base.hsts
        ? `max-age=${base.hstsMaxAge || 31536000}; includeSubDomains; preload`
        : "";
    const frameHeader = base.frameGuard || "SAMEORIGIN";
    const noSniffHeader = base.noSniff ? "nosniff" : "";
    const xssHeader = base.xssProtection ? "1; mode=block" : "0";
    const referrerHeader = base.referrerPolicy || "no-referrer";
    const permissionsHeader = base.permissionsPolicy || "";
    let cspStatic = null;
    let cspNeedsNonce = !!base.cspUseNonce;
    if (typeof base.csp === "string")
        cspStatic = base.csp;
    else if (base.csp && typeof base.csp === "object")
        cspStatic = buildCSPString(base.csp);
    if (base.ultraFastMode)
        cspNeedsNonce = false;
    const cspReportOnly = !!base.cspReportOnly;
    return async (ctx, next) => {
        try {
            if (base.hsts)
                setHeader(ctx, "Strict-Transport-Security", hstsHeader);
            setHeader(ctx, "X-Frame-Options", frameHeader);
            setHeader(ctx, "X-Content-Type-Options", noSniffHeader);
            setHeader(ctx, "X-XSS-Protection", xssHeader);
            setHeader(ctx, "Referrer-Policy", referrerHeader);
            if (permissionsHeader)
                setHeader(ctx, "Permissions-Policy", permissionsHeader);
            if (cspNeedsNonce) {
                const nonce = crypto.randomBytes(12).toString("base64");
                let cspHeader = cspStatic || `default-src 'self'; script-src 'self' 'nonce-${nonce}'`;
                if (cspReportOnly)
                    setHeader(ctx, "Content-Security-Policy-Report-Only", cspHeader);
                else
                    setHeader(ctx, "Content-Security-Policy", cspHeader);
                ctx.cspNonce = nonce;
            }
            else if (cspStatic) {
                if (cspReportOnly)
                    setHeader(ctx, "Content-Security-Policy-Report-Only", cspStatic);
                else
                    setHeader(ctx, "Content-Security-Policy", cspStatic);
            }
            return await next();
        }
        catch {
            return await next();
        }
    };
};
