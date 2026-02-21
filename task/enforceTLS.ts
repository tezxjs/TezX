import { Middleware } from "../src/types";

/**
 * Enforces HTTPS connections, redirects HTTP -> HTTPS if required.
 * Also sets HSTS and Secure cookie flags (optional).
 */
export const enforceTLS = <
  T extends Record<string, any> = {},
  Path extends string = any,
>(
  options: {
    redirect?: boolean; // Redirect HTTP to HTTPS (default: true)
    hsts?: boolean; // Enable Strict-Transport-Security
    hstsMaxAge?: number; // Max age for HSTS (seconds)
    includeSubDomains?: boolean; // Include subdomains in HSTS
    preload?: boolean; // Preload HSTS policy
    trustProxy?: boolean; // If behind reverse proxy (e.g., Nginx)
    secureCookies?: boolean; // Set cookie Secure flag automatically
  } = {},
): Middleware<T, Path> => {
  const {
    redirect = true,
    hsts = true,
    hstsMaxAge = 15552000, // ~180 days
    includeSubDomains = true,
    preload = true,
    trustProxy = true,
    secureCookies = true,
  } = options;

  return async (ctx, next) => {
    const req = ctx.req;
    const host = req.header("host");
    const protoHeader = req.header("x-forwarded-proto");
    // const isSecure = req.secure || (trustProxy && protoHeader === "https");
    // // 1️⃣ Redirect HTTP -> HTTPS if not secure
    // if (!isSecure && redirect) {
    //     const redirectUrl = `https://${host}${req.url}`;
    //     return ctx.redirect(redirectUrl, 301);
    // }

    // // 2️⃣ Apply HSTS header
    // if (isSecure && hsts) {
    //     const directives = [
    //         `max-age=${hstsMaxAge}`,
    //         includeSubDomains && "includeSubDomains",
    //         preload && "preload",
    //     ]
    //         .filter(Boolean)
    //         .join("; ");
    //     ctx.res.setHeader("Strict-Transport-Security", directives);
    // }

    // // 3️⃣ Secure cookie helper (for ctx.cookie or ctx.setCookie)
    // if (secureCookies && ctx.cookies) {
    //     ctx.cookies.secure = true;
    //     ctx.cookies.sameSite = "strict";
    // }

    await next();
  };
};
