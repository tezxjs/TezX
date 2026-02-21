# Rate Limiting Middleware (`rateLimiter`)

A robust, configurable middleware to throttle client requests and prevent abuse by limiting the number of requests per time window. Uses a sliding window strategy with in-memory storage by default (Redis support planned).

---

## ⚠️ Important: Use `getConnInfo()` First

To detect client IPs correctly (`ctx.req.remoteAddress`), **always register `getConnInfo()` before `rateLimiter`**:

```ts
import { getConnInfo } from "tezx/node"; // or "tezx/bun" / "tezx/deno"
import { rateLimiter } from "tezx/middleware/middleware";

app.use(getConnInfo()); // REQUIRED for IP detection
app.use(rateLimiter({ maxRequests: 100, windowMs: 60_000 }));
```

---

## Installation

```bash
npm install tezx
```

Import:

```ts
import { rateLimiter } from "tezx/middleware/middleware";
```

---

## Middleware Options (`RateLimiterOptions`)

| Option         | Type                                           | Default              | Description                                                                    |
| -------------- | ---------------------------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `maxRequests`  | `number`                                       | **Required**         | Max requests allowed per client in the time window                             |
| `windowMs`     | `number`                                       | **Required**         | Time window duration in milliseconds                                           |
| `keyGenerator` | `(ctx: Context) => string`                     | Client IP and port   | Function to uniquely identify clients (e.g., user ID or IP)                    |
| `storage`      | `{ get, set, clearExpired }`                   | In-memory Map        | Storage backend for tracking request counts (Redis support via custom storage) |
| `onError`      | `(ctx, retryAfter, error) => HttpBaseResponse` | Sends 429 by default | Custom handler called when rate limit is exceeded                              |

---

## Usage Examples

### Basic: Limit 100 requests per minute per IP

```ts
import { getConnInfo } from "tezx/node";
import { rateLimiter } from "tezx/middleware/middleware";

app.use(getConnInfo());
app.use(rateLimiter({
  maxRequests: 100,
  windowMs: 60_000,
}));
```

---

### Custom client identification (e.g., user ID)

```ts
app.use(rateLimiter({
  maxRequests: 10,
  windowMs: 10_000,
  keyGenerator: (ctx) => ctx.user?.id || ctx.ip,
  onError: (ctx, retryAfter) => {
    ctx.status = 429;
    return ctx.json({
      error: "Too Many Requests",
      retryAfter: `${retryAfter} seconds`,
    });
  },
}));
```

---

### Using Redis for distributed rate limiting

```ts
import Redis from "ioredis";

const redis = new Redis();

const redisStorage = {
  get: async (key) => {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : undefined;
  },
  set: async (key, value) => {
    await redis.set(key, JSON.stringify(value), "PX", value.resetTime - Date.now());
  },
  clearExpired: () => {
    // Redis auto-expires keys; no cleanup needed here
  },
};

app.use(getConnInfo());

app.use(rateLimiter({
  maxRequests: 50,
  windowMs: 60_000,
  storage: redisStorage,
}));
```

---

## How It Works

* Uses a **sliding window** algorithm counting requests per client key within `windowMs`.
* Default client key is `ip:port` but customizable via `keyGenerator`.
* Stores counts and reset times in a cache (default `Map` or custom storage).
* On exceeding limits, responds with HTTP 429 and `Retry-After` header.
* Adds these headers to every response:

  * `X-RateLimit-Limit` — Max allowed requests
  * `X-RateLimit-Remaining` — Remaining requests in current window
  * `X-RateLimit-Reset` — Timestamp when window resets
  * `Retry-After` — Seconds to wait before next allowed request (on 429)

---

## Best Practices

* Always use `getConnInfo()` **before** `rateLimiter`.
* Customize `keyGenerator` for authenticated users to rate limit by user ID.
* Use a distributed storage backend (like Redis) for multi-instance deployments.
* Adjust `maxRequests` and `windowMs` to fit your app's traffic and security needs.
* Use stricter limits on sensitive endpoints (e.g., login).
* Monitor and log rate limiting events to tune thresholds.

---

## Troubleshooting

| Problem                   | Cause                                 | Solution                                  |
| ------------------------- | ------------------------------------- | ----------------------------------------- |
| Too many 429 responses    | Low `maxRequests` or short `windowMs` | Increase limits or widen window duration  |
| Rate limiting not working | Missing `getConnInfo()` middleware    | Add `getConnInfo()` before `rateLimiter`  |
| Growing memory usage      | Many unique keys in in-memory storage | Use Redis or periodically cleanup storage |
| Unstable client keys      | Unstable/custom `keyGenerator` output | Ensure `keyGenerator` returns stable IDs  |

---

## Advanced: Different Limits by Route

```ts
const apiLimiter = rateLimiter({ maxRequests: 100, windowMs: 15 * 60_000 });
const loginLimiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });

app.use("/api/", apiLimiter);
app.use("/login", loginLimiter);
```

---

## Custom Error Handler Example

```ts
app.use(rateLimiter({
  maxRequests: 100,
  windowMs: 60_000,
  onError: (ctx, retryAfter) => {
    ctx.status = 429;
    return ctx.json({
      code: "RATE_LIMITED",
      message: `Please wait ${retryAfter} seconds before retrying.`,
      retryAfter,
    });
  },
}));
```

---
