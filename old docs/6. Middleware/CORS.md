
# CORS Middleware (`cors`)

Middleware for handling **Cross-Origin Resource Sharing (CORS)** in your TezX server. It allows you to configure which origins, methods, headers, and credentials are allowed.

## Import

```ts
import { cors } from "tezx/middleware";
```

---

## Options (`CorsOptions`)

```ts
export type CorsOptions = {
  /** Allowed origins for CORS.
   * Can be:
   * - A string: e.g. "https://example.com"
   * - An array of strings: e.g. ["https://example.com", "https://foo.com"]
   * - A function: (reqOrigin: string) => boolean
   */
  origin?: string | string[] | ((reqOrigin: string) => boolean);

  /** Allowed HTTP methods for CORS requests.
   * Defaults to ["GET", "POST", "PUT", "DELETE"]
   */
  methods?: string[];

  /** Allowed headers for CORS requests.
   * Defaults to ["Content-Type", "Authorization"]
   */
  allowedHeaders?: string[];

  /** Headers exposed to the browser */
  exposedHeaders?: string[];

  /** Indicates whether credentials (cookies/auth headers) are allowed */
  credentials?: boolean;

  /** Preflight cache duration (in seconds) */
  maxAge?: number;
};
```

---

## Usage

### Basic Usage

```ts
import { cors } from "tezx/middleware";

app.use(
  cors({
    origin: "*", // allow all origins
  })
);
```

### Restrict to a Single Origin

```ts
app.use(
  cors({
    origin: "https://example.com",
  })
);
```

### Restrict to Multiple Origins

```ts
app.use(
  cors({
    origin: ["https://example.com", "https://foo.com"],
  })
);
```

### Dynamic Origin Check

```ts
app.use(
  cors({
    origin: (reqOrigin) => {
      // allow only origins ending with 'mydomain.com'
      return reqOrigin.endsWith("mydomain.com");
    },
  })
);
```

### Custom Methods and Headers

```ts
app.use(
  cors({
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
    exposedHeaders: ["X-Custom-Header"],
  })
);
```

### Enable Credentials and Preflight Cache

```ts
app.use(
  cors({
    credentials: true,
    maxAge: 86400, // 1 day
  })
);
```

---

## Behavior

* Sets the following response headers automatically:

```text
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
Access-Control-Expose-Headers (optional)
Access-Control-Allow-Credentials (optional)
Access-Control-Max-Age (optional)
```

* Automatically responds to **OPTIONS preflight requests** with status `204` (No Content) and does **not call the next middleware**.

---

## Middleware Type

```ts
function cors<T extends Record<string, any> = {}, Path extends string = any>(
  option: CorsOptions = {}
): Middleware<T, Path>
```

* `T` – custom context type (optional)
* `Path` – route path type (optional)
* Returns a `Middleware` function compatible with TezX.

---

## Example with TezX Routes

```ts
import { router } from "tezx";
import cors from "tezx/middleware";

router.get("/api/data", cors(), async (ctx) => {
  return ctx.json({ message: "Hello World" });
});

router.post(
  "/api/secure",
  cors({
    origin: "https://example.com",
    credentials: true,
  }),
  async (ctx) => {
    return ctx.json({ message: "Secure POST request" });
  }
);
```

---

### Notes

* If `origin` is not provided, defaults to `"*"` (allow all origins).
* `methods` and `allowedHeaders` default to standard HTTP methods and headers.
* Preflight requests (`OPTIONS`) are handled automatically and will not call downstream middleware.

---
