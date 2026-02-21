# ⚡ `cacheControl` Middleware

A **super-lightweight, zero-overhead HTTP caching middleware** for your custom web framework.
It automatically adds proper `Cache-Control`, `Expires`, and optional `Vary` headers — dynamically, based on flexible caching rules.

---

## 🚀 Features

✅ Ultra-fast — optimized for V8 hot path (manual loop, no .find, no closures).
✅ Zero dependencies — pure TypeScript, ~1KB runtime footprint.
✅ Rule-based — apply dynamic caching based on request conditions.
✅ Fully safe — errors wrapped in `TezXError`, never crash the app.
✅ Works seamlessly with your existing `Context` and `Middleware` interfaces.

---

## 📦 Installation

If this middleware is part of your internal framework, just import directly:

```ts
import { cacheControl } from "tezx/middleware";
```

---

## 🧠 Usage Example

```ts
import { cacheControl } from "tezx/middleware";

app.use(
  cacheControl({
    defaultSettings: {
      maxAge: 3600, // 1 hour
      scope: "public",
    },
    rules: [
      {
        condition: (ctx) => ctx.url.startsWith("/api/private"),
        maxAge: 0,
        scope: "private",
      },
      {
        condition: (ctx) => ctx.url.includes("/images/"),
        maxAge: 86400, // 1 day
        scope: "public",
        vary: ["Accept-Encoding"],
      },
    ],
    onError: (error, ctx) => {
      ctx.setStatus = error.statusCode ?? 500;
      return ctx.json(error?.message)
    },
  })
);
```

---

## ⚙️ API Reference

### `cacheControl(options: CacheOptions): Middleware`

Creates and returns a new caching middleware function.

#### Parameters

| Name              | Type                                                                | Description                                                         |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `defaultSettings` | `CacheSettings`                                                     | Default caching policy applied when no rule matches.                |
| `rules`           | `CacheRule[]` *(optional)*                                          | Custom cache rules evaluated per request. First matching rule wins. |
| `onError`         | `(error: TezXError, ctx: Context) => HttpBaseResponse` *(optional)* | Custom error handler for middleware-level exceptions.               |

---

## 🧩 Type Definitions

```ts
export interface CacheRule {
  /** 🎯 Condition to determine if this rule applies */
  condition: (ctx: Context) => boolean;
  /** ⏳ Max age (in seconds) */
  maxAge: number;
  /** 🌐 Cache scope */
  scope: "public" | "private";
  /** 🏷️ Optional vary header */
  vary?: string[];
}

export interface CacheSettings
  extends Pick<CacheRule, "maxAge" | "scope" | "vary"> {}

export interface CacheOptions {
  defaultSettings: CacheSettings;
  rules?: readonly CacheRule[];
  onError?: (error: TezXError, ctx: Context) => HttpBaseResponse;
}
```

---

## 🧮 How It Works

1. Middleware runs **only** for `GET` and `HEAD` requests (no effect on POST/PUT).
2. It checks the provided `rules` sequentially.
3. The **first matching rule** determines the caching policy.
4. If no rules match, the `defaultSettings` are applied.
5. The following headers are set:

   * `Cache-Control: public, max-age=3600`
   * `Expires: <UTC datetime>`
   * `Vary: Accept-Encoding, ...` *(if specified)*

---

## 🧩 Error Handling

If an exception occurs inside your route handler or cache logic:

* The error is wrapped in `TezXError`.
* The middleware invokes `onError(error, ctx)` (if provided).
* Default behavior sets status `500` and a JSON body `{ error: "Cache middleware failed" }`.

---

## 🧭 Recommended Patterns

| Scenario            | Recommended Setting                             |
| ------------------- | ----------------------------------------------- |
| Static assets       | `{ scope: "public", maxAge: 86400 }`            |
| Authenticated API   | `{ scope: "private", maxAge: 0 }`               |
| Dynamic pages       | `{ scope: "public", maxAge: 60 }`               |
| Sensitive user data | Disable cache (`maxAge: 0`, `scope: "private"`) |

---

## 🧱 Example Integration with Router

```ts
app.use("/products", cacheControl({
  defaultSettings: { maxAge: 600, scope: "public" },
}));
```

---
