# 📘 Logger Middleware — `@tezx/logger`

## 🧩 Overview

The `logger` middleware provides structured, real-time logging of HTTP requests and responses for applications built with the TezX framework. It captures request lifecycle data, including method, path, status code, and response time, and prints them in a color-coded format to enhance debugging and monitoring.

---

## ✅ Key Features

* 📥 Logs every incoming HTTP request with method and path.
* ⏱ Measures and logs the execution time for each request.
* 🎯 Displays status codes and response completion details.
* ⚠️ Gracefully handles and logs runtime errors in middleware or handlers.
* 🎨 Color-coded output for enhanced readability (method, status, errors).

---

## 📦 Installation

```bash
bun add tezx
```

*Or if already using `tezx`, it's built-in.*

---

## 🚀 Usage

### 1. Import the Middleware

```ts
import { logger } from "tezx/middleware/logger";
```

### 2. Apply to Your App

```ts
import { TezX } from "tezx";
import { logger } from "tezx/middleware/logger";

const app = new TezX();
app.use(logger());
```

Or inside a `createApp` bootstrap function:

```ts
export function createApp() {
  const app = new TezX();
  app.use(logger());
  return app;
}
```

---

## ⚙️ Middleware Behavior

### Lifecycle

1. Logs: `--> METHOD PATH` when a request starts.
2. Tracks start time with `performance.now()`.
3. Waits for `await next()` to execute downstream logic.
4. After response: calculates duration and logs:

```bash
   <-- METHOD PATH STATUS_CODE TIMEms
```

5. On error: logs the error stack in red and rethrows it.

---

## 🧪 Example Output

```bash
--> GET /api/list
<-- GET /api/list 200 22.63ms

--> POST /auth/login
<-- POST /auth/login 401 13.71ms

--> GET /unknown
<-- GET /unknown 404 5.02ms

[x] Error: Invalid JSON
```

---

## 🧱 Middleware Return Signature

```ts
function logger(): Middleware;
```

Returns a `Middleware` function compatible with `.use()` or `addRoute()`.

---

## 📦 Integration Example with Full TezX Setup

```ts
import { TezX } from "tezx";
import { logger } from "tezx/middleware/logger";
import { CustomRouter } from "./router";

const app = new TezX({
  routeRegistry: new CustomRouter(),
  debugMode: true,
});

app.use(logger());
```

You can also attach it to all methods using `addRoute`:

```ts
app.addRoute({
  method: "ALL",
  path: "*",
  handler: logger(),
});
```

---

## 🛡 Error Handling

If any unhandled exception is thrown inside a middleware or route handler, `logger()`:

* Logs the stack trace in red (highlighted).
* Preserves stack for higher-level error middleware.
* Does not interfere with downstream error catchers.

---

## 📄 Related

* `@tezx/core` — core HTTP server utilities.
* `@tezx/router` — custom route registry support.
* `@tezx/middleware` — more built-in middleware (e.g., CORS, compression, JSON parser).

---
