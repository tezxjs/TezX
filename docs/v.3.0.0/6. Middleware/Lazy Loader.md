# `lazyLoader` Middleware

The `lazyLoader` middleware enables dynamic, lazy loading of modules in a `tezx` application based on route or query parameters. It supports caching, lifecycle hooks, and module validation to optimize performance and ensure reliability.

## Overview

The `lazyLoader` middleware enables dynamic, lazy loading of modules in a `tezx/lazy-loader` application based on runtime parameters (e.g., query, route, or custom logic). It supports caching, lifecycle hooks, module validation, and an optional `init` function for module-specific initialization. The `init` function is a critical feature, allowing modules to perform asynchronous setup, validate prerequisites, or short-circuit the request lifecycle. This document provides a unified explanation of the `init` function’s work procedure, its integration with the middleware, and a consolidated example that incorporates the diverse use cases from four demos.

### Key Features

- **Dynamic Module Loading**: Load modules on-demand via configurable loaders.
- **Caching**: Cache modules with customizable TTL and storage (e.g., `Map`, Redis).
- **Lifecycle Hooks**: Execute custom logic at stages like load, cache hit, or error.
- **Module Validation**: Ensure modules meet structural or behavioral criteria.
- **Initialization via `init`**: Perform asynchronous setup or early responses per module.
- **Flexible Module Identification**: Support query parameters, route parameters, or custom logic.

Import the middleware and related types:

```typescript
import { lazyLoader } from "tezx/lazy-loader";
```

### Type Definitions

```typescript
export type LazyModuleLoader<T> = () => Promise<T>;
export interface CacheItem<T = any> {
  module: T;
  expiresAt: number;
}
interface LazyLoadOptions<T> {
  moduleKey?: (ctx: Context) => string;
  getModuleLoader: (
    ctx: Context,
  ) => Promise<LazyModuleLoader<T> | null> | null | LazyModuleLoader<T>;
  queryKeyModule?: string;
  moduleContextKey?: string;
  enableCache?: boolean;
  cacheStorage?: {
    get: (key: string) => CacheItem<T> | undefined;
    set: (key: string, value: CacheItem<T>) => void;
    delete: (key: string) => void;
  };
  cacheTTL?: number;
  lifecycleHooks?: {
    onLoad?: (moduleName: string, ctx: Context) => void;
    onError?: (moduleName: string, error: Error, ctx: Context) => void;
    onComplete?: (moduleName: string, module: T, ctx: Context) => void;
    onCacheHit?: (moduleName: string, module: T, ctx: Context) => void;
    onCacheSet?: (moduleName: string, module: T, ctx: Context) => void;
  };
  validateModule?: (module: T) => boolean;
}
```

### Middleware Signature

```typescript
export const lazyLoader = <T = any>(options: LazyLoadOptions<T>): Middleware;
```

---

## Work Procedure of the `init` Function

### Purpose

The `init` function is an optional, asynchronous method exported by a module to:

- Perform setup tasks (e.g., initializing resources, fetching configurations).
- Validate request-specific prerequisites (e.g., API keys, tokens).
- Modify the `Context` object for downstream use.
- Return early responses to short-circuit the middleware chain (e.g., errors, redirects).

### Code Context

The `init` function is invoked in the middleware as follows:

```typescript
if (module.init && typeof module.init === "function") {
  const initResult = await module.init(ctx);
  if (initResult) {
    return initResult;
  }
}
```

### Operational Workflow

The `init` function is processed within the middleware pipeline as follows:

1. **Module Identification**:

   - The middleware determines the module name using `moduleKey`, `queryKeyModule`, or route parameters.
   - Example: `ctx.req.query.module` (Demo 1, 3), `ctx.req.params.module` (Demo 2), or `ctx.req.body.moduleName` (Demo 4).

2. **Module Loading**:

   - The `getModuleLoader` function returns a `LazyModuleLoader`, which dynamically imports the module.
   - The loaded module is validated using `validateModule` (if provided).

3. **init Function Detection**:

   - The middleware checks if the module exports an `init` function (`module.init && typeof module.init === "function"`).
   - If absent, the middleware skips to caching or context attachment.

4. **init Invocation**:

   - The `init` function is called with the `Context` object (`ctx`):

     ```typescript
     const initResult = await module.init(ctx);
     ```

   - The `Context` provides access to `req`, `res`, and custom properties, enabling request-specific logic.
   - Asynchronous operations (e.g., database queries, API calls) are awaited.

5. **Result Processing**:

   - **Truthy Result**: If `initResult` is non-falsy (e.g., `{ error: "Unauthorized" }`), the middleware returns it, halting further processing (e.g., no caching, no `next`).
   - **Falsy Result**: If `initResult` is `null`, `undefined`, or absent, the middleware continues.
   - The `Context` may be modified (e.g., `ctx.config = {...}`) for use by the module or downstream middleware.

6. **Post-Initialization**:

   - The module is cached (if `enableCache` is true) with the specified `cacheTTL`.
   - The module is attached to the context (`ctx[moduleContextKey] = module`).
   - The `onComplete` lifecycle hook is triggered.
   - The middleware proceeds to `await next()`.

7. **Error Handling**:
   - Errors thrown by `init` are caught in the middleware’s `try-catch` block.
   - The `onError` hook is invoked, and the response status is set to 500 (`ctx.setStatus = 500`).
   - The error is re-thrown for upstream handling.

### Integration Points

- **Before `init`**: Module loading and validation ensure the module is valid.
- **During `init`**: The function performs setup, validation, or early responses.
- **After `init`**: Caching, context attachment, and lifecycle hooks complete the cycle.
- **Short-Circuiting**: A truthy `initResult` bypasses caching, context attachment, and `next`.

---

#### `LazyLoadOptions<T>`

Configuration options for the `lazyLoader` middleware.

| Property           | Description                                               | Default                                                                      |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `moduleKey`        | Function to extract the module name from the context.     | `(ctx) => ctx.req.params[queryKeyModule] \|\| ctx.req.query[queryKeyModule]` |
| `getModuleLoader`  | Function to retrieve the module loader.                   | Required                                                                     |
| `queryKeyModule`   | Query parameter name to select the module.                | `"module"`                                                                   |
| `moduleContextKey` | Key to attach the loaded module to the context.           | `"module"`                                                                   |
| `enableCache`      | Enable caching of loaded modules.                         | `true`                                                                       |
| `cacheStorage`     | Custom cache storage implementation.                      | `Map<string, CacheItem<T>>`                                                  |
| `cacheTTL`         | Cache Time-To-Live (TTL) in milliseconds.                 | `3600000` (1 hour)                                                           |
| `lifecycleHooks`   | Lifecycle hooks for custom actions during module loading. | `{}`                                                                         |
| `validateModule`   | Function to validate the loaded module.                   | `undefined`                                                                  |

---

## Consolidated Example: Unified Production-Ready Application

This example combines features from all four demos:

- **Query-based loading** (Demo 1).
- **Route-based loading** (Demo 2).
- **Async `init` function** (Demo 3).
- **Custom module key with validation** (Demo 4).

It demonstrates a production-ready setup with robust error handling, caching, lifecycle hooks, and a complex `init` function.

### File Structure

```bash
project/
├── modules/
│   ├── dashboard.js
│   ├── orders.js
│   ├── auth.js
│   ├── report.js
└── server.js
```

### Code

**`server.js`**:

```typescript
import { Context } from "tezx";
import { lazyLoader, CacheItem } from "tezx/lazy-loader";

// Custom cache storage
const customCache = new Map<string, CacheItem>();
const cacheStorage = {
  get: (key: string) => customCache.get(key),
  set: (key: string, value: CacheItem) => customCache.set(key, value),
  delete: (key: string) => customCache.delete(key),
};

// Module loader map
const moduleLoaders: Record<string, () => Promise<any>> = {
  dashboard: () => import("./modules/dashboard.js"),
  orders: () => import("./modules/orders.js"),
  auth: () => import("./modules/auth.js"),
  report: () => import("./modules/report.js"),
};

// Middleware configuration
const lazyLoadMiddleware = lazyLoader({
  moduleKey: (ctx: Context) => {
    // Prioritize body, then query, then params
    return (
      ctx.req.body?.moduleName || ctx.req.query.module || ctx.req.params.module
    );
  },
  getModuleLoader: async (ctx: Context) => {
    const moduleName =
      ctx.req.body?.moduleName || ctx.req.query.module || ctx.req.params.module;
    return moduleLoaders[moduleName] || null;
  },
  queryKeyModule: "module",
  moduleContextKey: "loadedModule",
  enableCache: true,
  cacheTTL: 120000, // 2 minutes
  cacheStorage,
  lifecycleHooks: {
    onLoad: (moduleName, ctx) =>
      console.log(
        `Loading ${moduleName} for request ID: ${ctx.req.id || "unknown"}`,
      ),
    onCacheHit: (moduleName, module, ctx) =>
      console.log(`Cache hit for ${moduleName}`),
    onCacheSet: (moduleName, module, ctx) =>
      console.log(`Cached ${moduleName}`),
    onComplete: (moduleName, module, ctx) =>
      console.log(`Completed loading ${moduleName}`),
    onError: (moduleName, error, ctx) =>
      console.error(`Error in ${moduleName}: ${error.message}`),
  },
  validateModule: (module) => {
    // Require handler function and version property
    return (
      typeof module.handler === "function" && typeof module.version === "string"
    );
  },
});

// Create Tezx app
app.use(lazyLoadMiddleware);

// Routes
app.get("/api/query", async (ctx: Context) => {
  // Query-based (Demo 1, 3)
  const module = ctx.loadedModule;
  if (module && typeof module.handler === "function") {
    return module.handler(ctx);
  }
  ctx.setStatus = 404;
  return { error: "Module not found or invalid" };
});

app.get("/api/route/:module", async (ctx: Context) => {
  // Route-based (Demo 2)
  const module = ctx.loadedModule;
  if (module && typeof module.handler === "function") {
    return module.handler(ctx);
  }
  ctx.setStatus = 404;
  return { error: "Module not found or invalid" };
});

app.post("/api/body", async (ctx: Context) => {
  // Body-based (Demo 4)
  const module = ctx.loadedModule;
  if (module && typeof module.handler === "function") {
    return module.handler(ctx);
  }
  ctx.setStatus = 400;
  return { error: "Invalid or missing module" };
});
```

**`modules/dashboard.js`** (Demo 1-inspired):

```javascript
export const version = "1.0";
export const handler = (ctx) => ({
  message: "Dashboard module",
  data: { widgets: ["chart", "table"] },
});
```

**`modules/orders.js`** (Demo 2-inspired):

```javascript
export const version = "1.0";
export const handler = (ctx) => ({
  message: "Orders module",
  data: { orderId: ctx.req.query.orderId || 123 },
});
```

**`modules/auth.js`** (Demo 3-inspired, with complex `init`):

```javascript
export const version = "1.0";
export const init = async (ctx) => {
  const apiKey = ctx.req.headers["x-api-key"];
  if (!apiKey) {
    return {
      status: 401,
      error: "API key required",
    };
  }
  try {
    // Simulate async config fetch
    const config = await fetchConfig(apiKey);
    ctx.authConfig = config; // Attach to context
    return null;
  } catch (error) {
    return {
      status: 500,
      error: `Auth initialization failed: ${error.message}`,
    };
  }
};
export const handler = (ctx) => ({
  message: "Auth module",
  data: { token: "abc123", config: ctx.authConfig },
});

// Simulated async function
async function fetchConfig(apiKey) {
  return { apiKey, settings: { scope: "user" } };
}
```

**`modules/report.js`** (Demo 4-inspired):

```javascript
export const version = "1.0";
export const init = async (ctx) => {
  return null;
};
export const handler = (ctx) => ({
  message: "Report module",
  data: { type: ctx.req.body?.reportType || "sales" },
});
```

### Example Features

- **Unified Module Identification**: Supports query (`/api/query?module=...`), route (`/api/route/:module`), and body (`POST /api/body`) inputs.
- **Robust `init` Function**: The `auth` module demonstrates a complex `init` with API key validation, async configuration fetch, and context modification.
- **Custom Cache Storage**: Uses a `Map`-based cache with a 2-minute TTL.
- **Strict Validation**: Ensures modules have a `handler` function and `version` property.
- **Comprehensive Lifecycle Hooks**: Logs all stages (load, cache hit, cache set, complete, error).
- **Error Handling**: Gracefully handles missing modules, validation failures, and `init` errors.

---
