# 🧠 `detectBot` Middleware

Detect and block automated or malicious requests using advanced heuristics — combining **User-Agent analysis**, **IP blacklists**, **rate limiting**, and **custom detection logic**.
Built for **high performance** on **Bun**, **Node.js**, and **Deno** runtimes.

---

## 📦 Import

```ts
import { detectBot } from "tezx/middleware";
```

---

## 🚀 Quick Start

```ts
import { detectBot } from "tezx/middleware";

app.use(
  detectBot({
    enableRateLimiting: true,
    botUserAgents: ["bot", "crawler", "indexer"],
    onBotDetected: (ctx, reason) =>
      ctx.status(403).json({ error: `Bot detected: ${reason}` }),
  })
);
```

✅ The middleware automatically:

* Detects common bots by analyzing the **User-Agent** header
* Blocks requests from **blacklisted IPs**
* Throttles suspicious traffic via **rate limiting**
* Allows your own **custom detection rules**

---

## ⚙️ Configuration

### `DetectBotOptions`

| Option                 | Type                                                 | Default                               | Description                                                      |
| ---------------------- | ---------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| **botUserAgents**      | `string[]`                                           | `["bot", "spider", "crawl", "slurp"]` | List of User-Agent substrings that indicate bot traffic.         |
| **enableRateLimiting** | `boolean`                                            | `false`                               | Enable rate-limit based bot detection.                           |
| **maxRequests**        | `number`                                             | `30`                                  | Maximum allowed requests per IP within the window.               |
| **windowMs**           | `number`                                             | `60000`                               | Duration of rate-limit window (in milliseconds).                 |
| **storage**            | `object`                                             | `In-memory Map`                       | Custom storage for rate-limit tracking (Redis, Memcached, etc.). |
| **isBlacklisted**      | `(ctx: Context) => boolean \| Promise<boolean>`      | `() => false`                         | Function to check if IP is blacklisted.                          |
| **customBotDetector**  | `(ctx: Context) => boolean \| Promise<boolean>`      | `undefined`                           | Custom logic for detecting bots (headers, params, etc.).         |
| **onBotDetected**      | `(ctx: Context, reason: string) => HttpBaseResponse` | Returns `403 JSON`                    | Callback executed when a bot is detected.                        |

---

## 🧩 Example — Custom Setup

### 1. Detect by custom header or query

```ts
detectBot({
  customBotDetector: (ctx) => ctx.query?.token === "fake-token",
  onBotDetected: (ctx, reason) => ctx.status(403).json({ error: `Blocked by custom rule: ${reason}` }),
});
```

### 2. Block a specific IP

```ts
detectBot({
  isBlacklisted: (ctx) => ctx.req.remoteAddress.address === "192.168.0.42",
});
```

### 3. Redis-based rate-limit storage

```ts
detectBot({
  enableRateLimiting: true,
  storage: {
    get: (key) => myRedis.get(key),
    set: (key, value) => myRedis.set(key, JSON.stringify(value)),
    clearExpired: () => {},
  },
});
```

---

## ⚡ Performance

TezX automatically optimizes detection depending on the runtime:

| Runtime            | Detection Method                      | Performance Note                     |
| ------------------ | ------------------------------------- | ------------------------------------ |
| **Bun**            | Precompiled RegExp                    | 🧠 Fastest; uses native regex engine |
| **Node.js / Deno** | Manual `for..of` + `.includes()` loop | ⚙️ Optimized for V8                  |

---

## 🔍 Detection Flow

The middleware executes in the following order:

1. **User-Agent Check**
   Scans for known bot keywords in the User-Agent string.
2. **IP Blacklist Check**
   Executes your custom `isBlacklisted` callback.
3. **Rate-Limiting Check** *(optional)*
   Detects excessive requests per IP using `getConnInfo()`.
4. **Custom Detection**
   Executes your `customBotDetector` callback.
5. **Pass-through**
   Calls `next()` if no suspicious behavior is detected.

---

## ⚙️ Rate-Limiting Requirements

To use rate limiting, you must import `getConnInfo()` from your runtime adapter:

```ts
// Bun runtime
import { getConnInfo } from "tezx/bun";

// Node.js runtime
import { getConnInfo } from "tezx/node";

// Deno runtime
import { getConnInfo } from "tezx/deno";
```

Ensure the middleware has access to `ctx.req.remoteAddress`.

---

## 💡 Example Responses

| Scenario            | Default Response                                              |
| ------------------- | ------------------------------------------------------------- |
| Bot by User-Agent   | `{ "error": "Bot detected: User-Agent" }`                     |
| Rate-limit exceeded | `{ "error": "Rate limit exceeded. Retry after 45 seconds." }` |
| Blacklisted IP      | `{ "error": "Bot detected: Blacklisted IP" }`                 |

You can fully customize this behavior using `onBotDetected`.

---

## 🧰 Advanced Integration

Combine `detectBot` with other TezX middlewares for a layered defense:

```ts
import { detectBot } from "tezx/middleware";
import { cors } from "tezx/middleware";

app.use(cors());
app.use(detectBot({ enableRateLimiting: true }));
```

---

## 🧾 Type Definitions

```ts
type DetectBotOptions = {
  botUserAgents?: string[];
  enableRateLimiting?: boolean;
  maxRequests?: number;
  windowMs?: number;
  storage?: RateLimitStorage;
  isBlacklisted?: (ctx: Context) => boolean | Promise<boolean>;
  customBotDetector?: (ctx: Context) => boolean | Promise<boolean>;
  onBotDetected?: (ctx: Context, reason: string) => HttpBaseResponse;
};
```

---

## 🧩 Summary

| Feature                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| ✅ User-Agent detection | Detects bots via known patterns                |
| 🚫 IP Blacklisting     | Blocks known or suspicious IPs                 |
| ⚡ Rate Limiting        | Detects aggressive bot-like activity           |
| 🧠 Custom Heuristics   | Flexible detection logic per project           |
| 🛡️ Lightweight & Fast | Built for high-performance frameworks like Bun |
| 🔄 Pluggable Storage   | Works with Redis, Memory, or custom stores     |

---
