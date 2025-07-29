# 🕒 `requestTimeout` Middleware

Enforce dynamic, per-request timeouts in your middleware stack—complete with custom error handling, logging, and cleanup logic.

---

## 📌 Overview

The `requestTimeout` middleware is designed for frameworks using a `Context`-based architecture (like `tezx`). It:

* Dynamically sets timeouts per request.
* Gracefully handles timeout errors.
* Logs and cleans up after timeouts.
* Works seamlessly with other middleware.

---

## 🔧 API

### `requestTimeout(options: TimeoutOptions): Middleware`

#### `TimeoutOptions`

| Option            | Type                                             | Required | Description                                                                      |
| ----------------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `getTimeout`      | `(ctx: Context) => number`                       | ✅        | Returns timeout (in ms) based on the request context.                            |
| `onTimeout`       | `(ctx: Context, error: Error) => CallbackReturn` | ❌        | Called when request times out. Default: 504 + `{ error: "Request timed out." }`. |
| `logTimeoutEvent` | `(ctx: Context, error: Error) => void`           | ❌        | Called when timeout happens. Default: logs warning via `debugging.warn`.         |
| `cleanup`         | `(ctx: Context) => void`                         | ❌        | Cleanup hook after timeout (DB, streams, etc). Default: no-op.                   |

---

## ✨ Features

* ⏱ Dynamic timeouts based on route, headers, or user state
* 🧠 Custom handlers for timeout error response
* 📜 Event logging for timeout diagnostics
* 🧹 Reliable resource cleanup
* 🧩 Easy integration with existing middleware

---

## 🚀 Usage Examples

### ✅ Basic Timeout

```ts
import { requestTimeout } from "tezx/request-timeout";

app.use(requestTimeout({
  getTimeout: () => 5000, // 5 seconds
}));
```

> All requests timeout after 5 seconds.

---

### 📂 Per-Path Timeout

```ts
app.use(requestTimeout({
  getTimeout: (ctx) =>
    ctx.path.startsWith("/api/slow") ? 10000 : 3000,
  onTimeout: (ctx, error) => {
    ctx.setStatus = 504;
    ctx.body = {
      error: `Request to ${ctx.path} timed out.`,
    };
  },
}));
```

> Custom response for slow API paths.

---

### 🧾 With Logging & Cleanup

```ts
app.use(requestTimeout({
  getTimeout: () => 5000,
  logTimeoutEvent: (ctx, err) => {
    console.warn(`⏱ Timeout: ${ctx.method} ${ctx.path}`);
  },
  cleanup: (ctx) => {
    releaseDB(ctx.state.connection);
  },
}));
```

> Logs timeouts and ensures database connections are released.

---

### 🛡️ Auth-Aware Timeout

```ts
app.use(authenticate); // Sets ctx.user

app.use(requestTimeout({
  getTimeout: (ctx) => ctx.user ? 10000 : 3000,
}));
```

> Authenticated users get more generous timeouts.

---

## 📦 Behavior Summary

| Behavior          | Description                                        |
| ----------------- | -------------------------------------------------- |
| `getTimeout`      | Called first to get the timeout duration           |
| `onTimeout`       | Called only if timeout occurs                      |
| `logTimeoutEvent` | Invoked on timeout for diagnostics                 |
| `cleanup`         | Always runs in `finally`, even on error or timeout |

---

## ❗ Error Handling

* Timeout ➜ `onTimeout` called, response handled, middleware chain stops.
* Normal error ➜ Propagated normally.
* `cleanup` always runs—guaranteed by `finally`.

---

## 🧠 Best Practices

* Use short timeouts on user-facing endpoints.
* Customize `onTimeout` with helpful errors.
* Always log and release resources in `cleanup`.
* Test slow endpoints to verify timeout + cleanup.

---

## 🚫 Limitations

* Timer precision limited by JavaScript event loop.
* Assumes `ctx.method`, `ctx.path`, `ctx.setStatus`, and `ctx.body` exist.
* Doesn't automatically cancel long-running internal operations (e.g., DB queries).

---

## 📁 Types Export

```ts
import type {
  TimeoutOptions,
  requestTimeout,
} from "tezx/request-timeout";
```

---
