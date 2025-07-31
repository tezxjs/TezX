# DetectBot Middleware

`detectBot` is a powerful and extensible middleware designed to detect and handle bot traffic in your web applications. It combines multiple detection techniques like User-Agent analysis, IP blacklisting, query parameter flags, rate limiting, and custom logic to identify bots effectively.

---

## ⚠️ Important Prerequisite: Use `getConnInfo()` Middleware First

To enable accurate IP detection (used for IP blacklisting and rate limiting), you **must** register the `getConnInfo()` middleware **before** `detectBot()`:

```ts
import { getConnInfo } from "tezx/node"; // or "tezx/bun", "tezx/deno" depending on runtime
import { detectBot } from "tezx/middleware/detect-bot";

app.use(getConnInfo()); // <-- Injects IP info into ctx.req.remoteAddress
app.use(detectBot());
```

Failing to do so will cause IP-based detections to malfunction.

---

## Installation

```bash
npm install tezx
```

---

## Import

```ts
import { detectBot } from "tezx/middleware/detect-bot";
import { getConnInfo } from "tezx/node"; // or bun / deno
```

---

## Configuration Options

| Option                  | Type                                                                          | Default Value                         | Description                                                            |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `botUserAgents`         | `string[]`                                                                    | `["bot", "spider", "crawl", "slurp"]` | User-Agent substrings to detect bots                                   |
| `maxRequests`           | `number`                                                                      | `30`                                  | Max requests allowed within the rate-limit window                      |
| `windowMs`              | `number`                                                                      | `60000` (1 minute)                    | Rate limit window duration in milliseconds                             |
| `isBlacklisted`         | `(ctx: Context, ip: string) => boolean \| Promise<boolean>`                   | `() => false`                         | Async check to determine if an IP is blacklisted                       |
| `queryKeyBot`           | `string`                                                                      | `"bot"`                               | Query parameter key to flag bot traffic (e.g., `?bot=true`)            |
| `onBotDetected`         | `"block" \| ((ctx: Context, result: BotDetectionResult) => HttpBaseResponse)` | `"block"`                             | Action on bot detection: `"block"` or custom callback                  |
| `enableRateLimiting`    | `boolean`                                                                     | `false`                               | Enable rate limiting-based bot detection                               |
| `customBotDetector`     | `(ctx: Context) => boolean \| Promise<boolean>`                               | `() => false`                         | Custom asynchronous function to detect bots                            |
| `customBlockedResponse` | `(ctx: Context, result: BotDetectionResult) => HttpBaseResponse`              | Default 403 JSON error                | Custom response returned when bot is blocked                           |
| `storage`               | Custom storage with `get/set/clearExpired` for rate limiting state            | In-memory Map                         | Custom storage implementation, e.g., Redis, for rate limit persistence |
| `confidenceThreshold`   | `number` (0-1)                                                                | `0.5`                                 | Confidence threshold to mark as bot when multiple indicators are found |

---

## How It Works

1. **User-Agent Check**
   Scans the User-Agent header against common bot substrings.

2. **IP Blacklist Check**
   Checks if the client IP is blacklisted (customizable).

3. **Query Parameter**
   Detects bot traffic flagged by query params like `?bot=true`.

4. **Rate Limiting**
   Optionally tracks and limits requests per IP over a time window.

5. **Custom Detection Logic**
   Supports user-defined async functions for bespoke bot detection.

6. **Confidence Score**
   Combines multiple indicators to calculate a confidence score for nuanced detection.

7. **Response Handling**
   Blocks detected bots or triggers custom response handlers.

---

## Usage Examples

### Basic Usage (Block bots by User-Agent)

```ts
import { getConnInfo } from "tezx/node";
import { detectBot } from "tezx/middleware/detect-bot";

app.use(getConnInfo());
app.use(detectBot());

app.get("/", (ctx) => {
  return ctx.text("Hello, human!");
});
```

---

### Advanced Usage with IP Blacklist and Rate Limiting

```ts
app.use(getConnInfo());

app.use(
  detectBot({
    botUserAgents: ["bot", "crawler", "spider"],
    maxRequests: 15,
    windowMs: 60000,
    enableRateLimiting: true,
    isBlacklisted: async (ctx, ip) => {
      const blacklist = ["10.0.0.1", "192.168.0.5"];
      return blacklist.includes(ip);
    },
    customBotDetector: async (ctx) => !ctx.headers.get("referer"),
    onBotDetected: (ctx, { reason, indicators }) => {
      ctx.setStatus = 403;
      return ctx.json({ error: "Bot blocked", reason, indicators });
    },
  }),
);
```

---

### Using Redis for Distributed Rate Limiting

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
  clearExpired: () => {}, // Redis handles expiration automatically
};

app.use(getConnInfo());

app.use(
  detectBot({
    enableRateLimiting: true,
    storage: redisStorage,
    maxRequests: 50,
    windowMs: 60000,
  }),
);
```

---

## Best Practices

* Always register `getConnInfo()` **before** `detectBot`.
* Tune `maxRequests` and `windowMs` based on your app traffic patterns.
* Use `customBotDetector` for domain-specific bot patterns.
* Enable `GlobalConfig.debugging` to track bot detections during development.
* For production or multiple server instances, use a distributed store (Redis, etc.) for rate limiting.

---

## Sample Bot Detection Response

```json
{
  "error": "Bot blocked",
  "reason": "Multiple Indicators",
  "indicators": ["User-Agent", "Blacklisted IP", "Query Parameter"]
}
```

---
