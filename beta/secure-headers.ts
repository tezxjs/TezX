// middlewares/secureHeaders.ts
import { generateRandomBase64, GlobalConfig } from "../helper/index.js";
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
  ultraFastMode?: boolean; // disable per-request allocations
};

/**
 * Join CSP source list into a space-separated string.
 * @param {string|string[]} v - single source string or array of sources
 * @returns {string}
 */
const joinSrc = (v: string | string[]): string =>
  typeof v === "string" ? v : v.join(" ");
/**
 * Build a CSP header string from an object map.
 * Example input:
 * {
 *   "default-src": ["'self'"],
 *   "script-src": ["'self'", "https://cdn.example.com"]
 * }
 *
 * @param {Record<string, string | string[]>} cspObj
 * @returns {string} Built CSP string (directives separated by `; `)
 */
const buildCSPString = (cspObj: Record<string, string | string[]>): string => {
  const parts: string[] = [];
  for (const key in cspObj) parts.push(`${key} ${joinSrc(cspObj[key])}`);
  return parts.join("; ");
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
export const secureHeaders = <
  T extends Record<string, any> = {},
  Path extends string = any,
>(
  userOpts: SecureHeadersOptions = {},
): Middleware<T, Path> => {
  const defaultPresets: Record<string, SecureHeadersOptions> = {
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
  if (base.hsts?.includeSubDomains) hstsParts.push("includeSubDomains");
  if (base.hsts?.preload) hstsParts.push("preload");
  const hstsHeader = hstsParts.join("; ");

  let cspStatic: string | null = null;
  let cspNeedsNonce = !!base.cspUseNonce;

  if (typeof base.csp === "string") cspStatic = base.csp;
  else if (base.csp)
    cspStatic = buildCSPString(base.csp as Record<string, string | string[]>);

  const cspReportOnly = !!base.cspReportOnly;
  const ultraFast = !!base.ultraFastMode;
  if (cspNeedsNonce && ultraFast) {
    GlobalConfig.debugging.warn(
      "secureHeaders: ultraFastMode disables CSP nonce support. Nonce will not be used.",
    );
  }
  if (ultraFast) cspNeedsNonce = false;

  return async (ctx, next) => {
    try {
      // HSTS (only on HTTPS optionally)
      if (base.hsts) {
        const proto = (ctx.req?.header("x-forwarded-proto") || "").toString();
        if (!base.hsts.hstsOnlyOnHttps || proto.includes("https")) {
          ctx.headers.set("Strict-Transport-Security", hstsHeader);
        }
      }
      // Core headers
      ctx.headers.set("X-Frame-Options", frameHeader);
      ctx.headers.set("X-Content-Type-Options", noSniffHeader);
      ctx.headers.set("X-XSS-Protection", xssHeader);
      ctx.headers.set("Referrer-Policy", referrerHeader);
      if (permissionsHeader)
        ctx.headers.set("Permissions-Policy", permissionsHeader);
      // CSP
      if (cspNeedsNonce) {
        const nonce = generateRandomBase64();
        let cspHeader = cspStatic;
        if (!cspHeader) {
          cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}'`;
        }
        if (typeof base.csp === "object") {
          const idx = cspHeader.indexOf("script-src");
          if (idx >= 0) {
            const parts: string[] = [];
            parts.push(cspHeader.slice(0, idx + 10));
            parts.push(" 'nonce-" + nonce + "'");
            parts.push(cspHeader.slice(idx + 10));
            cspHeader = parts.join("");
          } else {
            cspHeader += "; script-src 'self' 'nonce-" + nonce + "'";
          }
        }
        (ctx as any).cspNonce = nonce;
        if (cspReportOnly)
          ctx.headers.set("Content-Security-Policy-Report-Only", cspHeader);
        else ctx.headers.set("Content-Security-Policy", cspHeader);
      } else if (cspStatic) {
        if (cspReportOnly)
          ctx.headers.set("Content-Security-Policy-Report-Only", cspStatic);
        else ctx.headers.set("Content-Security-Policy", cspStatic);
      }
      return await next();
    } catch (err) {
      console.error("secureHeaders middleware error", err);
      return await next();
    }
  };
};
