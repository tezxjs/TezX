# 🚀 PoweredBy Middleware

## Overview

The `poweredBy` middleware adds an `X-Powered-By` HTTP header to every response, indicating your server or framework name. It’s lightweight and allows optional customization of the header value.

---

## Features

* Adds `X-Powered-By` header to all responses.
* Optional custom server name (defaults to `"TezX"`).
* Simple and efficient middleware for Express-like environments.

---

## Installation

Make sure your app supports middleware (e.g., Express, Koa, TezX).

---

## Usage

### Import

```ts
import { poweredBy } from "tezx/middleware/powered-by";
```

### Apply Middleware

```ts
app.use(poweredBy());           // Sets header to "TezX"
app.use(poweredBy("MyServer")); // Sets header to "MyServer"
```

---

## Function Signature

```ts
export const poweredBy = (serverName?: string) => Middleware;
```

* **`serverName`** *(optional)* — Custom string for `X-Powered-By` header. Default: `"TezX"`

---

## How it works

1. Middleware sets `X-Powered-By` header on the response.
2. Uses provided `serverName` or `"TezX"` by default.
3. Calls `next()` to continue request handling.

---

## Example Response Header

```http
X-Powered-By: MyServer
```

---

## Notes

* Add this middleware early in your stack to ensure the header is included.
* Changing the header value can help with branding or obscure server details for security.

---
