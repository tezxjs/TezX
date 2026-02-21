
# `requestTimeout` Middleware Documentation

## Overview

The `requestTimeout` middleware for **TezX** is designed to **automatically enforce time limits on requests**. Each request can have its own timeout duration, and you can also define a **custom handler** if a request exceeds its time limit.

> ⚡ **Key idea:** Internally, this middleware uses `setTimeout` to track request duration and cancel long-running requests.

---

## Installation

```ts
import {requestTimeout} from "tezx/middleware";
```

---

## Usage

```ts
import {requestTimeout} from "tezx/middleware";

app.use(requestTimeout({
  getTimeout: (ctx) => {
    // Requests to /slow paths get 10s, others 3s
    return ctx.path.startsWith("/slow") ? 10000 : 3000;
  },
  onTimeout: (ctx, err) => {
    // Custom response when timeout occurs
    return ctx.status(504).json({ error: err.message });
  }
}));
```

---

## Options

The middleware accepts a **`TimeoutOptions` object**:

### 1. `getTimeout: (ctx: Context) => number`

* **Required.**
* A function that receives the **current request context (`ctx`)** and returns a **timeout in milliseconds**.
* Example:

```ts
getTimeout: (ctx) => ctx.path === "/upload" ? 20000 : 5000;
```

This means the `/upload` route gets 20 seconds, while all other routes get 5 seconds.

---

### 2. `onTimeout?: (ctx: Context, error: TezXError) => HttpBaseResponse | void`

* **Optional.**
* A function invoked **when a request exceeds its timeout**.
* You can send a custom response or log the error.
* Default behavior:

```ts
(ctx) => ctx.status(504).json({ error: "Request timed out." });
```

---

## How It Works

1. When a request arrives, the middleware calls `getTimeout(ctx)` to determine how long it should wait.

2. It then uses **`setTimeout`** internally to trigger a timeout error if the request takes too long.

   ```ts
   timeoutId = setTimeout(() => reject(new TezXError(`Request timed out after ${timeout}ms`)), timeout);
   ```

3. The middleware runs the next handler (`next()`) **and races it against the timeout** using `Promise.race()`.

4. If the request finishes in time, the result is returned normally.

5. If the timeout occurs first, the `onTimeout` handler is called.

6. Finally, the `setTimeout` is cleared to **prevent memory leaks**.

---

## Example Scenarios

### Default Timeout (No `onTimeout` provided)

```ts
app.use(requestTimeout({
  getTimeout: (ctx) => 5000 // 5 seconds
}));
```

If a request takes longer than 5 seconds, the client gets:

```json
{
  "error": "Request timed out."
}
```

---

### Custom Timeout Response

```ts
app.use(requestTimeout({
  getTimeout: (ctx) => 10000,
  onTimeout: (ctx, err) => ctx.status(408).json({
    message: "Oops! Your request took too long.",
    detail: err.message
  })
}));
```

Response when timeout occurs:

```json
{
  "message": "Oops! Your request took too long.",
  "detail": "Request timed out after 10000ms"
}
```

---

## Advantages

* ✅ Dynamically set timeouts per request.
* ✅ Custom error handling.
* ✅ Prevents server from being blocked by slow requests.
* ✅ Easy to integrate with existing TezX apps.

---

## Notes

* **`setTimeout`** is the core mechanism used internally.
* This middleware does **not cancel ongoing operations**, it only stops waiting for them in the response.
* Use this middleware to protect your server from **long-running or stuck requests**.

---
