
# `basicAuth` Middleware

## Overview

`basicAuth` is a flexible authentication middleware supporting multiple methods:

* **Basic Authentication**
* **Bearer Token**
* **API Key**

It also supports:

* Rate limiting (optional)
* Role-Based Access Control (RBAC) checks (optional)
* Custom unauthorized handlers
* Dynamic realm name generation

---

## Usage

### Basic Setup

```ts
import {basicAuth} from "tezx/middleware/basic-auth";
app.use(
  basicAuth({
    validateCredentials: async (method, credentials, ctx) => {
      // Implement your validation logic per method and credentials here
      // Return true if valid, false otherwise
    },
  })
);
```

### Optional Configurations

```ts
basicAuth({
  validateCredentials,
  
  // Customize the HTTP Basic auth realm shown on prompt (default: "Restricted Area")
  getRealm: (ctx) => "My Protected API",

  // Customize response for unauthorized access
  onUnauthorized: (ctx, error) => {
    ctx.setStatus = 401;
    ctx.setHeader("WWW-Authenticate", `Basic realm="${getRealm(ctx)}"`);
    ctx.body = { error: error?.message || "Unauthorized" };
  },

  // Rate limiting configuration (optional)
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    // Optional: Provide custom storage; default storage created if omitted
    // storage: customStorage,
  },

  // Supported methods to accept (default: all three)
  supportedMethods: ["basic", "api-key", "bearer-token"],

  // Optional RBAC check for access control
  checkAccess: async (ctx, credentials) => {
    // Return true if user is authorized, false otherwise
  },
});
```

---

## Important Notes

### 1. Node.js Buffer Requirement

* For Node.js, the middleware uses:

  ```ts
  import { Buffer } from "node:buffer";
  ```

* This is necessary to decode Base64 Basic Auth credentials.

### 2. Rate Limiting Requires `getConnInfo`

* To enable rate limiting, you **must** add the `getConnInfo` middleware **before** `basicAuth`.

* This middleware populates `ctx.req.remoteAddress` which `basicAuth` uses to track IPs for rate limiting.

Example:

```ts
import { getConnInfo } from "tezx/bun";
// or
import { getConnInfo } from "tezx/deno";
// or
import { getConnInfo } from "tezx/node";

app.use(getConnInfo());
app.use(
  basicAuth({
    rateLimit: {
      maxRequests: 50,
      windowMs: 60000,
    },
    validateCredentials,
  }),
);
```

---

## TypeScript Types

```ts
export type AuthMethod = "basic" | "api-key" | "bearer-token";

export type AuthCredential = {
  username?: any;
  password?: any;
  token?: any;
  apiKey?: any;
};

export type DynamicBasicAuthOptions = {
  validateCredentials: (
    method: AuthMethod,
    credentials: AuthCredential,
    ctx: Context,
  ) => boolean | Promise<boolean>;

  getRealm?: (ctx: Context) => string;

  onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;

  rateLimit?: {
    storage?: {
      get: (key: string) => { count: number; resetTime: number } | undefined;
      set: (key: string, value: { count: number; resetTime: number }) => void;
      clearExpired: () => void;
    };
    maxRequests: number;
    windowMs: number;
  };

  supportedMethods?: AuthMethod[];

  checkAccess?: (
    ctx: Context,
    credentials: AuthCredential,
  ) => boolean | Promise<boolean>;
};
```

---

## Summary

| Feature                     | Notes                                                   |
| --------------------------- | ------------------------------------------------------- |
| Basic Auth                  | Decodes Base64 credentials using `Buffer`               |
| Bearer Token & API Key      | Reads from `Authorization` header or `x-api-key` header |
| Rate Limiting               | Requires `injectRemoteAddress` middleware               |
| Custom Unauthorized Handler | Use `onUnauthorized` option                             |
| RBAC                        | Use `checkAccess` option for access control             |
