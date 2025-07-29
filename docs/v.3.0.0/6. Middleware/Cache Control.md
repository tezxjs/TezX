# 🧊 `cacheControl` Middleware

## 📘 Overview

The `cacheControl` middleware manages HTTP caching headers intelligently, improving performance and reducing unnecessary server load. It supports fine-grained control over client and intermediary caching behavior.

---

## ✨ Key Features

* 🔧 Dynamic `Cache-Control` headers (`max-age`, `public`/`private`)
* 📅 Sets accurate `Expires` headers
* ♻️ Supports the `Vary` header for smart client-side caching
* 🔐 Generates ETags (strong or weak) and handles `If-None-Match`
* 📉 Automatically returns `304 Not Modified` if ETag matches
* 🧠 Rule-based configuration per request path/context
* 📢 Customizable event logging for cache hits/misses/errors

---

## 📦 Installation

```ts
import { cacheControl } from "tezx/cache-control";
```

> ⚠️ Requires **Node.js**, as it uses `node:crypto` for hashing.

---

## ⚙️ Configuration

### Middleware Initialization

```ts
app.use(cacheControl({
  defaultSettings: {
    maxAge: 120,
    scope: "public",
    enableETag: true,
    vary: ["Accept-Encoding"]
  },
  useWeakETag: true,
  rules: [...],
  logEvent: (event, ctx, error) => {
    if (event === "error") {
      console.error(`[CACHE ERROR] ${error?.message}`);
    } else {
      console.log(`[CACHE ${event.toUpperCase()}] ${ctx.method} ${ctx.pathname}`);
    }
  },
}));
```

---

## 🔧 Options

| Option            | Type                                      | Description                                                            |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `defaultSettings` | `CacheSettings` (required)                | Fallback cache behavior if no rule matches.                            |
| `rules`           | `CacheRule[]` (optional)                  | Conditional caching rules per request.                                 |
| `useWeakETag`     | `boolean` (optional)                      | Generate weak ETags (`W/`) instead of strong ones.                     |
| `logEvent`        | `(event, ctx, error?) => void` (optional) | Logs events: `"cached"`, `"no-cache"`, or `"error"` during processing. |

---

## 📘 `CacheRule` Type

```ts
type CacheRule = {
  condition: (ctx: Context) => boolean;
  maxAge: number;
  scope: "public" | "private";
  enableETag: boolean;
  vary?: string[];
};
```

> First matching rule is applied.

---

## 🧪 Usage Examples

### Basic Setup with Default Caching

```ts
cacheControl({
  defaultSettings: {
    maxAge: 60, // 1 minute
    scope: "public",
    enableETag: true,
  }
});
```

### Advanced with Rules

```ts
cacheControl({
  defaultSettings: {
    maxAge: 120,
    scope: "public",
    enableETag: true,
    vary: ["Accept-Encoding"]
  },
  rules: [
    {
      condition: ctx => ctx.pathname.startsWith("/api/private"),
      maxAge: 0,
      scope: "private",
      enableETag: false
    },
    {
      condition: ctx => ctx.pathname.startsWith("/static"),
      maxAge: 86400,
      scope: "public",
      enableETag: true,
      vary: ["Accept-Encoding"]
    }
  ]
});
```

---

## ⚙️ How It Works

1. **Request Type Check**

   * Only processes `GET` and `HEAD` methods.
   * Others bypass cache logic.

2. **Rule Evaluation**

   * Scans `rules` and applies the first match.
   * If none, uses `defaultSettings`.

3. **Header Generation**

   * `Cache-Control`: Based on `maxAge` and `scope`.
   * `Expires`: Based on current time + `maxAge`.
   * `Vary`: If provided.

4. **ETag Handling**

   * Generates hash of the response body.
   * Compares against `If-None-Match`.
   * Returns `304 Not Modified` if matched.

5. **Logging**

   * Calls `logEvent` if provided.

---

## ⚠️ Limitations & Notes

* **Node.js only**: Uses `crypto` for hashing.
* **GET/HEAD only**: Avoids side effects on other methods.
* **Performance tip**: Avoid ETag on large dynamic responses to reduce hash load.
* **ETag is generated post-body**: Middleware must run after body is set.

---

## 🚨 Error Handling

If an error occurs (e.g., during hashing):

* Logs using `logEvent` with type `"error"`.
* Responds with `500 Internal Server Error` and JSON:

```json
{ "error": "Failed to set cache headers." }
```

---

## 📋 Summary Table

| Feature             | Support                        |
| ------------------- | ------------------------------ |
| Cache-Control       | ✅ Dynamic max-age + scope      |
| Expires             | ✅ Set with `Date.now + maxAge` |
| ETag                | ✅ Strong & weak supported      |
| Conditional Request | ✅ Returns 304 when matched     |
| Vary Header         | ✅ Optional per rule            |
| Rules Support       | ✅ Context-aware strategy       |
| Logging             | ✅ Via `logEvent()`             |
| Platform            | ❗ Node.js required             |

---
