# PoweredBy Middleware (`poweredBy`)

Middleware for adding an **`X-Powered-By`** header to HTTP responses. This is commonly used to indicate the server or framework powering the application.

---

## Import

```ts
import { poweredBy } from "tezx/middleware";
```

---

## Parameters

```ts
const poweredBy = (serverName?: string): Middleware => { ... }
```

* `serverName` (optional) – A custom server name to use in the header.

  * Default: `"TezX"`

---

## Usage

### Basic Usage

Adds the default `X-Powered-By` header with value `"TezX"`:

```ts
import { poweredBy } from "tezx/middleware";
app.use(poweredBy());
```

* Response Header Example:

```bash
X-Powered-By: TezX
```

### Custom Server Name

```ts
app.use(poweredBy("MyServer"));
```

* Response Header Example:

```bash
X-Powered-By: MyServer
```

---

## Middleware Type

```ts
function poweredBy(serverName?: string): Middleware
```

* Returns a `Middleware` function compatible with TezX.
* Can be used **globally** or **per route**.

---

## Example with TezX Routes

```ts
import poweredBy from "tezx/middleware/poweredBy";

// Set global X-Powered-By header
app.use(poweredBy());

// Sample route
app.get("/api/data", async (ctx) => {
  return ctx.json({ message: "Hello World" });
});

// Override with custom server name for a specific route
app.get("/api/custom", poweredBy("CustomServer"), async (ctx) => {
  return ctx.json({ message: "Custom Header Applied" });
});
```

* `/api/data` response header: `X-Powered-By: TezX`
* `/api/custom` response header: `X-Powered-By: CustomServer`

---
