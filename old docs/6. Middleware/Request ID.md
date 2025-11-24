# Request ID Middleware (`requestID`)

Middleware for assigning a **unique request ID** to every incoming HTTP request. Useful for **request tracking**, **logging**, and **debugging**.

---

## Import

```ts
import { requestID } from "tezx/middleware";
```

---

## Parameters

```ts
const requestID = (
  headerName: string = "X-Request-ID",
  contextKey: string = "requestID",
): Middleware => { ... }
```

| Parameter    | Type     | Default          | Description                                              |
| ------------ | -------- | ---------------- | -------------------------------------------------------- |
| `headerName` | `string` | `"X-Request-ID"` | The HTTP header to store the request ID.                 |
| `contextKey` | `string` | `"requestID"`    | Key to store the request ID in the TezX context (`ctx`). |

---

## Behavior

1. Checks if the incoming request already has the request ID header.
2. If not present, generates a new unique ID using `generateUUID()`.
3. Sets the request ID in:

   * **HTTP header** (`ctx.headers.set(headerName, requestId)`)
   * **TezX context** (`ctx[contextKey] = requestId`)
4. Can be accessed by downstream middleware or handlers using `ctx[contextKey]`.

---

## Usage

### Basic Usage

```ts
import { requestID } from "tezx/middleware";

app.use(requestID());

// Access request ID in a route
router.get("/api/data", async (ctx) => {
  console.log("Request ID:", ctx.requestID);
  return ctx.json({ requestID: ctx.requestID });
});
```

* Adds header:

```bash
X-Request-ID: req-<unique-id>
```

---

### Custom Header Name

```ts
app.use(requestID("X-Custom-Request-ID"));
```

* Sets the request ID in `X-Custom-Request-ID` header and context key `requestID`:

```ts
ctx.requestID // contains the generated ID
```

---

### Custom Context Key

```ts
app.use(requestID("X-Request-ID", "reqId"));

// Access in route
router.get("/api/data", async (ctx) => {
  console.log(ctx.reqId); // custom context key
  return ctx.json({ reqId: ctx.reqId });
});
```

---

## Middleware Type

```ts
function requestID(headerName?: string, contextKey?: string): Middleware
```

* Returns a `Middleware` function compatible with TezX.
* Can be used **globally** or **per-route**.

---

## Example with Logger Integration

```ts
import {requestID,logger} from "tezx/middleware";

app.use(requestID()); // assign request ID
app.use(logger());    // log requests including request ID

app.get("/api/users", async (ctx) => {
  return ctx.json({ requestID: ctx.requestID });
});
```

* Each log can include the unique request ID for traceability.

---
