# 🛡️ `secureHeaders` Middleware

Secure your HTTP responses with modern, configurable security headers. Ideal for protecting web applications against common browser-based vulnerabilities.

---

## 📌 Overview

The `secureHeaders` middleware dynamically sets HTTP security headers, applying best practices by default while allowing custom configurations per route or request.

---

## ✨ Features

* ✅ Applies essential HTTP security headers
* ⚙️ Fully customizable per header
* 🧠 Supports dynamic values via functions (per request)
* 🧪 Environment-aware defaults (e.g. HSTS in production only)

---

## 📦 Installation

```ts
import { secureHeaders } from "tezx/secure-headers";
```

---

## 🚀 Usage

### Minimal Setup (Defaults Applied)

```ts
app.use(secureHeaders());
```

### With Custom Header Configuration

```ts
app.use(
  secureHeaders({
    contentSecurityPolicy: "default-src 'self'",
    frameGuard: true,
    hsts: true,
    referrerPolicy: "no-referrer",
  }),
);
```

---

## 🔧 Function Signature

```ts
export const secureHeaders = (options?: SecurityHeaderOptions): Middleware;
```

### Parameters

* `options` *(optional)*: `SecurityHeaderOptions` – object defining custom header values (strings, booleans, or functions).

### Returns

A middleware function that injects the configured security headers into HTTP responses.

---

## 🧱 Supported Security Headers

| Header                      | Default Value                                                                              | Purpose                                 |
| --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';` | Prevents resource injection (XSS, etc.) |
| `X-Frame-Options`           | `DENY`                                                                                     | Blocks clickjacking                     |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` *(only in production)*                               | Enforces HTTPS                          |
| `X-XSS-Protection`          | `1; mode=block`                                                                            | Enables legacy XSS protection           |
| `X-Content-Type-Options`    | `nosniff`                                                                                  | Prevents MIME-sniffing                  |
| `Referrer-Policy`           | `no-referrer`                                                                              | Controls what `Referer` is sent         |
| `Permissions-Policy`        | `geolocation=(), microphone=(), camera=()`                                                 | Restricts browser APIs                  |

---

## 🧠 Dynamic Header Configuration

Each option supports either:

* A **static string or boolean** (enabled/disabled)
* A **function**: `(ctx: Ctx) => string | undefined`

### Example: Route-specific CSP

```ts
secureHeaders({
  contentSecurityPolicy: (ctx) =>
    ctx.url.startsWith("/admin")
      ? "default-src 'self'; script-src 'self';"
      : undefined, // fallback to default
});
```

---

## 🌐 Example

```ts
import { secureHeaders } from "tezx/secure-headers";

app.use(
  secureHeaders({
    hsts: false, // Disable HSTS
    contentSecurityPolicy: (ctx) =>
      ctx.url.startsWith("/admin")
        ? "default-src 'self'; script-src 'self';"
        : undefined,
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
);

app.get("/", (ctx) => ctx.send("Hello, World!"));
app.get("/admin", (ctx) => ctx.send("Admin Dashboard"));
```

---

## 🧪 Testing & Verification

### 1. Default Route

```bash
curl -I http://localhost:3000/
```

Expected:

```
Content-Security-Policy: default-src 'self';
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

### 2. Admin Route with Custom CSP

```bash
curl -I http://localhost:3000/admin
```

Expected:

```bash
Content-Security-Policy: default-src 'self'; script-src 'self';
```

---

### 3. HSTS Disabled

No `Strict-Transport-Security` header is present.

---

## ✅ Best Practices

* ✅ Place early in middleware chain to ensure headers are applied globally.
* ✅ Use dynamic rules for admin or sensitive routes.
* ✅ Keep `unsafe-inline` to a minimum in CSP.
* ✅ Use `hsts: true` only in production (enabled by default in prod).

---

## 🔐 Security Summary

| Threat                 | Defense Mechanism                  |
| ---------------------- | ---------------------------------- |
| XSS (script injection) | `Content-Security-Policy`, `X-XSS` |
| Clickjacking           | `X-Frame-Options`                  |
| Protocol downgrade     | `Strict-Transport-Security`        |
| MIME sniffing          | `X-Content-Type-Options`           |
| Over-sharing referrers | `Referrer-Policy`                  |
| Feature abuse          | `Permissions-Policy`               |

---
