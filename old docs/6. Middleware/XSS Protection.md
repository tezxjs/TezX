# 🛡️ XSS Protection Middleware (`xssProtection`)

The `xssProtection` middleware **adds HTTP headers to protect against Cross-Site Scripting (XSS) attacks**. It sets the `X-XSS-Protection` header and optionally a fallback `Content-Security-Policy` (CSP) for enhanced security.

This middleware is lightweight and ideal for **web apps, APIs, or any server-rendered content**.

---

## 📦 Import

```ts
// Named import
import { xssProtection } from "tezx/middleware";
```

---

## ⚙️ Options

```ts
export type XSSProtectionOptions = {
  enabled?: boolean | ((ctx: Context) => boolean);
  // Whether XSS protection is enabled
  // Default: true
  // Can also be a function to enable/disable dynamically per request

  mode?: "block" | "filter";
  // Protection mode
  // Default: "block"
  // "block": Prevent page rendering if XSS detected
  // "filter": Attempt to sanitize content

  fallbackCSP?: string;
  // Fallback Content-Security-Policy header
  // Default: "default-src 'self'; script-src 'self';"
  // Can be customized to allow trusted CDNs or stricter policies
};
```

---

## 🧩 Behavior

1. Determines if protection is **enabled**.

   * Can be static (`true`/`false`) or dynamic using a callback function.
2. Sets the `X-XSS-Protection` header:

   * `1; mode=block` → blocks rendering on XSS detection.
   * `1` → filters the XSS content without blocking.
3. Sets a **fallback CSP header** (`Content-Security-Policy`) if none is present.
4. Calls the **next middleware** in the chain.

---

## ✅ Default Usage

```ts
import {xssProtection} from "tezx/middleware";

app.use(xssProtection());
```

* Enables XSS protection in **block mode**.
* Adds default fallback CSP:
  `default-src 'self'; script-src 'self';`
* Works for all incoming requests.

---

## ⚙️ Custom Configuration

```ts
app.use(
  xssProtection({
    mode: "filter", // sanitize instead of blocking
    fallbackCSP: "default-src 'self'; script-src 'self' https://trusted.cdn.com",
  })
);
```

* Filters XSS content instead of blocking.
* Allows scripts from trusted CDNs via CSP.

---

## 🔄 Dynamic Enabling per Request

```ts
app.use(
  xssProtection({
    enabled: (ctx) => !ctx.isAdmin, // Disable for admin routes
  })
);
```

* Enables XSS protection **only for non-admin routes**.
* Dynamic decision can be based on user role, path, headers, or any context property.

---

## 🧩 Headers Set by Middleware

| Header                    | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `X-XSS-Protection`        | Activates browser XSS filtering (`1` or `1; mode=block`)           |
| `Content-Security-Policy` | Fallback CSP policy if none is set, provides additional mitigation |

---

## 💡 Best Practices

* Always enable XSS protection for **public-facing routes**.
* Use **block mode** (`mode: "block"`) in production for strong security.
* Add a **fallback CSP** to prevent script injection from untrusted sources.
* Use **dynamic `enabled`** to disable for trusted internal routes if needed.
* Combine with other middlewares like `cors` or `logger` for full-stack security.

---

## 🔧 Full Example: Web App Integration

```ts
import xssProtection from "tezx/middleware/xssProtection";
import logger from "tezx/middleware/logger";
import cors from "tezx/middleware/cors";

app.use(cors());
app.use(logger());
app.use(
  xssProtection({
    mode: "block",
    fallbackCSP: "default-src 'self'; script-src 'self' https://cdn.example.com",
    enabled: (ctx) => !ctx.user?.isAdmin, // Skip admin panel
  })
);

app.get("/", (ctx) => {
  ctx.send("<h1>Hello, World!</h1>");
});
```

* **Public pages** have full XSS protection.
* **Admin panel** can disable blocking for convenience.
* CSP ensures scripts are loaded only from trusted sources.

---
