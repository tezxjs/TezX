# Logger Middleware (`logger`)

Middleware for logging incoming HTTP requests and responses. Logs the **method**, **pathname**, **status code**, and **execution time** for each request. Useful for debugging and monitoring your TezX server.

---

## Import

```ts
import { logger } from "tezx/middleware";
```

---

## Options (`LoggerOptions`)

```ts
export interface LoggerOptions {
  /** Enable or disable logging. Default: true */
  enabled?: boolean;
}
```

* `enabled` – Boolean flag to enable or disable logging.

  * `true` – logs requests (default)
  * `false` – disables logging for silent operation

---

## Usage

### Basic Usage

```ts
import { logger } from "tezx/middleware";


app.use(logger()); // logging enabled by default

app.get("/api/data", async (ctx) => {
  return ctx.json({ message: "Hello World" });
});
```

### Disable Logging

```ts
app.use(logger({ enabled: false }));
```

---

## Behavior

1. **Logs Incoming Request**
   When a request comes in, it logs:

```bash
<-- METHOD /pathname
```

Example:

```bash
<-- GET /api/data
```

2. **Measures Execution Time**
   The middleware measures how long the downstream middleware or handler takes to complete.

3. **Logs Response**
   After the request is processed, it logs:

```bash
--> METHOD /pathname STATUS_CODE TIME
```

Example:

```bash
--> GET /api/data 200 3.45ms
```

4. **Error Logging**
   If an error occurs during request processing, it logs the stack trace:

```bash
Error: <stack trace>
```

---

## Middleware Type

```ts
function logger(options?: LoggerOptions): Middleware
```

* Returns a `Middleware` function compatible with TezX.
* Can be used globally or per-route.

---

## Example with TezX Routes

```ts
import logger from "tezx/middleware";

// Enable logger globally
app.use(logger());

// Sample route
app.get("/api/users", async (ctx) => {
  return ctx.json({ users: [] });
});

// Disable logger for a specific route
app.post("/api/secret", logger({ enabled: false }), async (ctx) => {
  return ctx.json({ secret: "hidden" });
});
```

---

## Console Output Example

```text
<-- GET /api/users
--> GET /api/users 200 2.14ms

<-- POST /api/secret
--> POST /api/secret 200 1.07ms
```

* `<--` indicates **incoming request**
* `-->` indicates **response completed**
* Execution time shows **performance of route handler**

---
