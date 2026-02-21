# 🚦 Rate Limiter Middleware (`rateLimiter`)

The `rateLimiter` middleware **limits the number of requests per client** over a configurable time window. It is ideal for **preventing abuse, brute-force attacks, or accidental API overload**.

It supports **custom client identification**, **custom storage**, and **custom error handling**.

---

## 📦 Import

```ts
// Standard import
import { rateLimiter } from "tezx/middleware";
```

---

## ⚙️ Options

```ts
export type RateLimiterOptions = {
  maxRequests: number;         // Maximum requests per window
  windowMs: number;            // Time window in milliseconds

  keyGenerator?: (ctx: Context) => string;
  // Generate a unique client key
  // default: use IP address from x-forwarded-for / client-ip / remoteAddress

  storage?: {
    get: (key: string) => { count: number; resetTime: number } | undefined;
    set: (key: string, value: { count: number; resetTime: number }) => void;
    clearExpired: () => void;
  };
  // Custom storage for tracking rate limits (e.g., Map, Redis)

  onError?: (
    ctx: Context,
    retryAfter: number,
    error: Error
  ) => HttpBaseResponse;
  // Custom callback when rate limit is exceeded
};
```

---

## 🧩 Behavior

* Each client is identified by a **key** (IP by default, or custom via `keyGenerator`).
* Requests are counted per **time window (`windowMs`)**.
* Response headers provided:

  * `X-RateLimit-Limit`: maximum requests allowed.
  * `X-RateLimit-Remaining`: requests remaining in current window.
  * `X-RateLimit-Reset`: timestamp (ms) when window resets.
  * `Retry-After`: seconds until the window resets (only sent when limit exceeded).
* If the client exceeds `maxRequests`, the `onError` callback is invoked (default: throw `429 Too Many Requests`).

---

## ✅ Default Behavior

```ts
app.use(
  rateLimiter({
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
  })
);
```

* Limits each client to **100 requests per minute**.
* Sends standard rate-limit headers.
* Returns `429` when exceeded.

---

## 🔑 Custom Client Key Example

Use authenticated user IDs or tokens instead of IP addresses.

```ts
app.use(
  rateLimiter({
    maxRequests: 10,
    windowMs: 10_000, // 10 seconds
    keyGenerator: (ctx) => ctx.user?.id || ctx.ip,
  })
);
```

* Useful for APIs behind proxies or load balancers.
* Ensures rate limiting is per **user** instead of per IP.

---

## 🗄️ Custom Storage (Redis Example)

You can replace the default in-memory store with Redis:

```ts
import { redisClient } from "./redisClient";

const redisStorage = {
  get: async (key: string) => {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : undefined;
  },
  set: async (key: string, value: { count: number; resetTime: number }) => {
    await redisClient.set(key, JSON.stringify(value), "PX", value.resetTime - Date.now());
  },
  clearExpired: () => {}, // Redis automatically expires keys
};

app.use(
  rateLimiter({
    maxRequests: 50,
    windowMs: 60_000,
    storage: redisStorage,
  })
);
```

---

## ⚠️ Custom Error Handler

You can customize the response when the client exceeds the limit:

```ts
app.use(
  rateLimiter({
    maxRequests: 5,
    windowMs: 60_000,
    onError: (ctx, retryAfter) => {
      ctx.setStatus = 429;
      return ctx.json({
        success: false,
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
      });
    },
  })
);
```

* Allows sending JSON, HTML, or custom formatted responses.
* Still receives `Retry-After` header automatically.

---

## 🧾 Headers Sent by Middleware

| Header                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `X-RateLimit-Limit`     | Maximum requests per window                      |
| `X-RateLimit-Remaining` | Requests left in the current window              |
| `X-RateLimit-Reset`     | Timestamp (ms) when the window resets            |
| `Retry-After`           | Seconds until next allowed request (only on 429) |

---

## 💡 Best Practices

* Always use **`maxRequests` + `windowMs`** appropriate for your API traffic.
* Use **custom keyGenerator** for user-based rate limiting.
* Use **Redis or other distributed store** if deploying behind multiple servers.
* Always include the `Retry-After` header for clients.
* Combine with other middleware like `logger` or `cors` for robust APIs.

---

## Example: Full Stack Integration

```ts
import { app } from "tezx";
import rateLimiter from "tezx/middleware/rateLimiter";
import logger from "tezx/middleware/logger";
import cors from "tezx/middleware/cors";

app.use(cors());
app.use(logger());
app.use(
  rateLimiter({
    maxRequests: 100,
    windowMs: 60_000,
    keyGenerator: (ctx) => ctx.user?.id || ctx.ip,
  })
);

app.get("/api/data", async (ctx) => {
  ctx.json({ success: true, data: ["item1", "item2"] });
});
```

---
