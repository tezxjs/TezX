
# **`secureHeaders` Middleware**

`secureHeaders` is a TezX-compatible middleware for adding **HTTP security headers** like HSTS, CSP, X-Frame-Options, and more. It supports presets, custom configurations, and optional per-request CSP nonces. Optimized for both **production** and **development**.

---

## **Installation**

```ts
import { secureHeaders } from 'tezx/middleware';
```

---

## **Usage Example**

```ts
app.use(secureHeaders({
  preset: 'strict',       // strong defaults
  cspUseNonce: true,      // generate per-request nonce for inline scripts
}));
```

---

## **Preset Options**

| Preset     | Description                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `strict`   | Strongest security for production: HSTS 2yrs, CSP enforcement, frame-guard DENY, XSS & sniffing. |
| `balanced` | Default preset for most apps: reasonable headers, CSP report-only.                               |
| `dev`      | Development mode: permissive headers, allows localhost, unsafe-inline scripts.                   |

---

## **SecureHeadersOptions & What Each Option Does**

```ts
export type SecureHeadersOptions = {
    preset?: "strict" | "balanced" | "dev";
    hsts?: HstsOptions;
    frameGuard?: "DENY" | "SAMEORIGIN" | string;
    noSniff?: boolean;
    xssProtection?: boolean;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    csp?: string | Record<string, string | string[]>;
    cspReportOnly?: boolean;
    cspUseNonce?: boolean;
    ultraFastMode?: boolean;
};
```

---

### 1. **preset**

* Chooses a pre-configured security set.
* Default: `"balanced"`
* **Use Case:** Quick setup without manual configuration.
* **Example:** `'strict'` for production, `'dev'` for local development.

---

### 2. **hsts** (HTTP Strict Transport Security)

* Adds `Strict-Transport-Security` header.
* Forces HTTPS and optionally applies to subdomains.
* **Example:**

```ts
{
  maxAge: 31536000,          // 1 year
  includeSubDomains: true,   // apply to all subdomains
  preload: true,             // for browser preload list
  hstsOnlyOnHttps: true,     // only on HTTPS requests
}
```

* **Use Case:** Prevent man-in-the-middle attacks over HTTP.
* **Tip:** Only use `preload` if you are confident about HTTPS everywhere.

---

### 3. **frameGuard**

* Sets `X-Frame-Options` header to prevent clickjacking.
* **Values:**

  * `'DENY'` → never allow framing
  * `'SAMEORIGIN'` → allow only same-origin
  * custom string allowed
* **Default:** `'SAMEORIGIN'`
* **Use Case:** Prevent your site being embedded in iframes to avoid UI redress attacks.

---

### 4. **noSniff**

* Sets `X-Content-Type-Options: nosniff`.
* Prevents browsers from MIME type sniffing.
* **Default:** true for strict/balanced presets.
* **Use Case:** Stops content misinterpretation vulnerabilities.

---

### 5. **xssProtection**

* Sets `X-XSS-Protection: 1; mode=block`.
* Legacy protection for older browsers.
* **Default:** true for strict/balanced presets.
* **Use Case:** Extra protection in legacy browsers; modern browsers rely on CSP.

---

### 6. **referrerPolicy**

* Sets `Referrer-Policy` header.
* **Examples:** `"no-referrer"`, `"strict-origin-when-cross-origin"`.
* **Use Case:** Control what referrer info browsers send, improves privacy/security.
* **Default:** preset-dependent.

---

### 7. **permissionsPolicy**

* Sets `Permissions-Policy` header (formerly Feature-Policy).
* **Controls:** access to features like geolocation, microphone, camera.
* **Example:** `'geolocation=(), microphone=()'`
* **Use Case:** Limit access to sensitive APIs to reduce attack surface.

---

### 8. **csp** (Content Security Policy)

* Prevents XSS, data injection, and unsafe script execution.
* Can be a **string** or an **object map** of directives:

```ts
{
  "default-src": ["'self'"],
  "script-src": ["'self'", "https://cdn.example.com"],
  "style-src": ["'self'", "'unsafe-inline'"],
}
```

* **Use Case:** Strict CSP prevents malicious script execution.
* **Tip:** Use object to precompute string at middleware init for performance.

---

### 9. **cspReportOnly**

* Sends `Content-Security-Policy-Report-Only` instead of enforcement.
* **Use Case:** Test CSP without blocking scripts.

---

### 10. **cspUseNonce**

* Generates **per-request nonce** for inline scripts.
* Injected as `'nonce-<value>'` in `script-src`.
* Inline scripts must use same nonce:

```html
<script nonce="ctx.cspNonce">
  console.log("Allowed inline script");
</script>
```

* **Use Case:** Allows safe inline scripts without `'unsafe-inline'`.

---

### 11. **ultraFastMode**

* Disables per-request allocations (like nonce generation).
* Useful for **high-QPS APIs**.
* **Use Case:** Skip nonce if inline scripts are not needed.

---

## **HSTS Options (HstsOptions)**

```ts
export interface HstsOptions {
    maxAge?: number;             // in seconds
    includeSubDomains?: boolean; // apply to all subdomains
    preload?: boolean;           // add to browser preload list
    hstsOnlyOnHttps?: boolean;   // only apply on HTTPS
}
```

---

## **Middleware Flow**

1. Checks protocol (HSTS only on HTTPS if configured)
2. Sets core headers:

   * `X-Frame-Options`
   * `X-Content-Type-Options`
   * `X-XSS-Protection`
   * `Referrer-Policy`
   * `Permissions-Policy`
3. Sets CSP headers:

   * `Content-Security-Policy` or `Content-Security-Policy-Report-Only`
   * Optionally includes per-request nonce
4. Passes context to `next()` middleware.

---

## **Example with Inline Scripts (Nonce)**

```ts
app.use(secureHeaders({ cspUseNonce: true }));

// Template:
<script nonce="<%= ctx.cspNonce %>">
  console.log("This inline script is allowed!");
</script>
```

---

## **Developer Notes / Tips**

* **Strict preset:** production-ready, enforce all headers.
* **Balanced preset:** good for initial deployment; CSP report-only.
* **Dev preset:** permissive for local dev; allows unsafe-inline.
* **UltraFastMode:** skip nonce generation for high-QPS APIs.
* Always use **HTTPS** when HSTS is enabled.
* **Nonce values** are per-request and cryptographically random (if using `generateRandomBase64`).

---

## **Quick Reference: What each header does**

| Header                                | Purpose                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `Strict-Transport-Security`           | Forces HTTPS, prevents MITM, optional preload                              |
| `X-Frame-Options`                     | Prevent clickjacking (DENY / SAMEORIGIN)                                   |
| `X-Content-Type-Options`              | Stops MIME sniffing (`nosniff`)                                            |
| `X-XSS-Protection`                    | Legacy XSS protection in older browsers                                    |
| `Referrer-Policy`                     | Controls which referrer info browsers send                                 |
| `Permissions-Policy`                  | Controls access to sensitive browser APIs                                  |
| `Content-Security-Policy`             | Controls scripts, styles, images, etc., prevents XSS and injection attacks |
| `Content-Security-Policy-Report-Only` | Test-only CSP enforcement without blocking scripts                         |

## **Full Example:**

```ts
import { secureHeaders } from "tezx/middleware";

// Use secureHeaders middleware
app.use(
  secureHeaders({
    preset: "strict",        // strongest security
    cspUseNonce: true,       // generate nonce per request
    ultraFastMode: false,    // allow nonce generation
  })
);

// Example route
app.get("/", (ctx) => {
  // If cspUseNonce is enabled, nonce is available in ctx.cspNonce
  const nonce = ctx.cspNonce || "fallback-nonce";
  return ctx.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Secure Headers Example</title>
        <script nonce="${nonce}">
          console.log("This inline script is allowed by CSP nonce!");
        </script>
      </head>
      <body>
        <h1>Hello Secure World!</h1>
      </body>
    </html>
  `);
});

```

---
