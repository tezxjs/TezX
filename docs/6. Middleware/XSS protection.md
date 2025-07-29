# XSS Protection Middleware

## Overview

The `xssProtection` middleware provides robust cross-site scripting (XSS) protection by setting appropriate security headers and implementing configurable protection strategies. This middleware is designed to be flexible while providing sensible defaults for most use cases.

## Installation

```ts
import { xssProtection } from "tezx/xss-protection";
```

## Basic Usage

```ts
app.use(xssProtection());
```

## Advanced Configuration

```ts
app.use(
  xssProtection({
    enabled: (ctx) => !ctx.isAdmin, // Disable for admin routes
    mode: "filter", // Sanitize instead of block
    fallbackCSP: "default-src 'self' https://trusted.cdn.com",
  }),
);
```

## Configuration Options

### `enabled: boolean | (ctx: Context) => boolean`

* **Default:** `true`
* Enables or disables the XSS protection.
* Can be a static boolean or a function that evaluates dynamically based on request context.

#### Examples

```ts
enabled: true; // Always enabled
enabled: (ctx) => !ctx.url.startsWith("/admin"); // Disabled for admin
```

---

### `mode: "block" | "filter"`

* **Default:** `"block"`
* Defines the behavior when XSS is detected:

  * `"block"`: Prevents page from rendering.
  * `"filter"`: Tries to sanitize and allow rendering.

#### Examples

```ts
mode: "block";  // More secure, stricter
mode: "filter"; // More tolerant, user-friendly
```

---

### `fallbackCSP: string`

* **Default:** `"default-src 'self'; script-src 'self';"`
* Fallback CSP applied only when no `Content-Security-Policy` header is already set.
* Helps secure older browsers or edge cases.

#### Example

```ts
fallbackCSP: "default-src 'none'; script-src 'self' https://trusted.cdn.com";
```

---

## Technical Implementation Details

### Headers Set

| Header                    | Example Value          | Purpose                            |
| ------------------------- | ---------------------- | ---------------------------------- |
| `X-XSS-Protection`        | `1; mode=block` or `1` | Enables browser XSS filters        |
| `Content-Security-Policy` | As configured          | Fallback policy for older browsers |

### Flow

1. Check if protection is enabled.
2. Determine `X-XSS-Protection` mode based on config.
3. Set fallback CSP if no existing CSP header exists.
4. Proceed to the next middleware.

---

## Debug Logging

* 🟠 Skipped protection due to `enabled = false`
* 🟢 Set `X-XSS-Protection` header
* 🟣 Applied fallback `Content-Security-Policy`

---

## Best Practices

* ✅ Use `"block"` mode in production unless filtering is required.
* ✅ Only disable protection for trusted internal/admin routes.
* ✅ Complement this middleware with:

  * Input sanitization
  * Output escaping
  * Proper CSP setup

---

## Browser Compatibility

| Browser       | `X-XSS-Protection` Support | CSP Support  |
| ------------- | -------------------------- | ------------ |
| Chrome (≤78)  | ✅                          | ✅            |
| Edge (Legacy) | ✅                          | ✅            |
| Firefox       | ❌ (ignores this header)    | ✅ (CSP only) |
| Safari        | ✅                          | ✅            |

* **Tip:** Rely on CSP as a long-term strategy — `X-XSS-Protection` is deprecated in some browsers.

---

## Security Considerations

* "Block" mode is safest, but test for layout/content impact.
* "Filter" mode offers more flexibility for legacy or complex UIs.
* Always pair with CSP, validation, and escaping mechanisms.

---

## Example: Per-Route XSS Mode

```ts
app.use(
  xssProtection({
    enabled: (ctx) => ctx.url.startsWith("/public"),
    mode: "filter",
  }),
);
```
