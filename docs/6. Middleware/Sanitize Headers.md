# SanitizeHeaders Middleware (`sanitizeHeaders`)

Middleware for **sanitizing HTTP headers** to enhance security and compliance. It allows you to **whitelist** allowed headers, **blacklist** disallowed headers, and removes dangerous or unnecessary headers to prevent **information leakage** or **header injection attacks**.

---

## Import

```ts
import { sanitizeHeaders } from "tezx/middleware";
```

---

## Options (`SanitizeHeadersOptions`)

```ts
export type SanitizeHeadersOptions = {
  /**
   * 🟢 Whitelist of allowed headers (case-insensitive)
   * @default [] (allow all headers if empty)
   */
  whitelist?: string[];

  /**
   * 🔴 Blacklist of disallowed headers (case-insensitive)
   * @default [] (block none if empty)
   */
  blacklist?: string[];
};
```

* `whitelist` – Only headers in this list are **kept**; all others are removed.
* `blacklist` – Headers in this list are **removed** regardless of whitelist.
* Header names are **case-insensitive**.

---

## Usage

### Basic Usage

```ts
import { sanitizeHeaders } from "tezx/middleware";
app.use(sanitizeHeaders());
```

* With defaults, all headers are allowed unless explicitly removed elsewhere.

---

### Whitelist Only

```ts
app.use(
  sanitizeHeaders({
    whitelist: ["content-type", "authorization"],
  })
);
```

* Keeps only `Content-Type` and `Authorization` headers; all others are removed.

---

### Blacklist Only

```ts
app.use(
  sanitizeHeaders({
    blacklist: ["x-powered-by", "server"],
  })
);
```

* Removes `X-Powered-By` and `Server` headers, while keeping all others.

---

### Combined Whitelist & Blacklist

```ts
app.use(
  sanitizeHeaders({
    whitelist: ["content-type", "authorization", "accept"],
    blacklist: ["x-powered-by"],
  })
);
```

* Keeps only headers in whitelist, except those in blacklist (`X-Powered-By` is removed even if present in whitelist).

---

## Middleware Type

```ts
function sanitizeHeaders(options?: SanitizeHeadersOptions): Middleware
```

* Returns a `Middleware` function compatible with TezX.
* Should be applied **before sending response** to ensure headers are sanitized.

---

## Example with TezX Routes

```ts
import { router } from "tezx";
import sanitizeHeaders from "tezx/middleware/sanitizeHeaders";

router.use(
  sanitizeHeaders({
    whitelist: ["content-type", "authorization"],
    blacklist: ["x-powered-by", "server"],
  })
);

router.get("/api/data", async (ctx) => {
  return ctx.json({ message: "Headers sanitized!" });
});
```

* Ensures that only allowed headers are present in the response.

---
