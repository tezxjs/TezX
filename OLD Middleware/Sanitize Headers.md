# 🧼 `sanitizeHeaders` Middleware

Enhance HTTP request header hygiene by normalizing, filtering, and sanitizing headers — designed for modern web security and compliance.

---

## 📌 Overview

The `sanitizeHeaders` middleware provides a powerful mechanism to:

* Enforce **header name and value sanitation**
* Strip disallowed headers via **whitelist or blacklist**
* Normalize header names for consistency
* Defend against **header injection** attacks (e.g. CRLF)

---

## 📦 Installation

```ts
import { sanitizeHeaders } from "tezx/middleware/sanitize-headers";
```

---

## 🚀 Basic Usage

```ts
app.use(sanitizeHeaders());
```

> All incoming request headers will be normalized and sanitized using default safe policies.

---

## ⚙️ Advanced Configuration

```ts
app.use(
  sanitizeHeaders({
    whitelist: ["accept", "content-type", "authorization"],
    blacklist: ["x-powered-by", "server"],
    allowUnsafeCharacters: false,
  }),
);
```

---

## 🔧 Configuration Options

### `whitelist: string[]`

* **Default:** `[]` (allows all headers)
* Case-insensitive list of allowed header names.
* When non-empty, **only these headers are preserved**.

```ts
whitelist: ["content-type", "authorization"];
```

---

### `blacklist: string[]`

* **Default:** `[]` (blocks none)
* Case-insensitive list of header names to **explicitly remove**.

```ts
blacklist: ["x-powered-by", "server"];
```

---

### `allowUnsafeCharacters: boolean`

* **Default:** `false`
* When `false`, removes **control characters (e.g., CR/LF)** from header values to mitigate injection attacks.

```ts
allowUnsafeCharacters: true; // Less secure
```

---

## 🛠 Internal Processing Flow

1. **Iterate headers** → one-by-one
2. **Normalize header names** (if enabled)
3. **Apply whitelist / blacklist**
4. **Validate header name format**: must match `/^[a-zA-Z0-9\-_]+$/`
5. **Sanitize values**:

   * Trims whitespace
   * Removes dangerous characters (unless allowed)
6. **Rebuild headers**
7. **Overwrite original request headers**

---

## 🐛 Debug Logging

When enabled, the global debugging utility reports:

* 🚫 Removed headers due to policy
* ⚠️ Invalid header names
* ⚠️ Suspicious or empty values

---

## 🧠 Best Practices

### 1. Secure Defaults

```ts
app.use(
  sanitizeHeaders({
    whitelist: ["accept", "content-type", "authorization"],
  }),
);
```

### 2. Hide Server Internals

```ts
app.use(
  sanitizeHeaders({
    blacklist: ["x-powered-by", "server", "x-aspnet-version"],
  }),
);
```

### 3. Compatibility Assurance

* Test against your client apps before enforcing strict whitelists.
* Monitor which headers are stripped unexpectedly.

### 4. Layered Security

* Use in conjunction with:

  * CORS middleware
  * Content Security Policy (CSP)
  * XSS/CSRF protection middleware

---

## ⚡ Performance Notes

* Fast execution: single-pass header processing
* Case-insensitive lookups are optimized
* Tip: Normalize whitelist values for faster lookup:

```ts
whitelist: ["content-type", "authorization"].map((h) => h.toLowerCase());
```

---

## 🔐 Security Highlights

| Threat                  | Protection                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| Header Injection (CRLF) | Stripped by default                                                   |
| Technology exposure     | Use `blacklist` to hide `"x-powered-by"`, `"server"` headers          |
| Unsafe values           | Control characters removed (unless `allowUnsafeCharacters` is `true`) |

---

## ✅ Client Compatibility

* Compatible with all modern browsers and clients.
* Changes affect server-side only.
* Useful for:

  * APIs serving untrusted clients
  * Systems requiring strict request validation
  * Compliance-heavy environments (e.g. PCI, HIPAA)

---
