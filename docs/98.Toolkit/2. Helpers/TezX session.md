# ⚡ @tezx/session

### Simple, Secure & Type-Safe Session Middleware for **TezX**

Build scalable applications with pluggable session storage, secure cookies, and developer-friendly TypeScript APIs.

---

## ✨ Features

* ✅ **Type-Safe** session data (Generics support)
* 🔐 Secure, HTTP-only cookie session IDs
* ⚙️ Customizable session storage (Memory, Redis, etc.)
* 🔄 Simple Middleware: `useSession()`, `createSession()`, `destroySession()`
* 🌐 CORS-friendly: Supports `credentials: 'include'`
* 🧩 Extensible for microservices & SSR apps

---

## 📦 Installation

```bash
npm install @tezx/session
```

OR

```bash
pnpm add @tezx/session
```

---

## ⚙️ Quick Example

```ts
import { TezX } from "tezx";
import { SessionManager } from "@tezx/session";

const app = new TezX();

const sessionManager = new SessionManager({
  sessionName: "tezx.sid",
  cookie: { maxAge: 1000 * 60 * 30, httpOnly: true, secure: true, sameSite: "lax" },
});

// Load session before routes
app.use(sessionManager.useSession());

// Login route → create session
app.post("/login", async (ctx) => {
  await sessionManager.createSession({ userId: 99, role: "admin" }, ctx);
  return ctx.json({ success: true });
});

// Protected route → read session
app.get("/profile", (ctx) => {
  return ctx.json({ session: ctx.session?.data });
});

// Logout → destroy session
app.post("/logout", async (ctx) => {
  await ctx.session?.destroy();
  return ctx.json({ loggedOut: true });
});
```

---

## 🛡️ API Documentation

### 🔑 SessionManager

| Method             | Description                                 |
| ------------------ | ------------------------------------------- |
| `createSession()`  | Create and save a session                   |
| `useSession()`     | Middleware: Load session from cookie        |
| `destroySession()` | Destroy session from store and clear cookie |

---

### 📄 `createSession(data, ctx)`

* Creates a session.
* Automatically sets a session cookie in the response.
* Saves session data to the configured storage.

Example:

```ts
await sessionManager.createSession({ userId: 101 }, ctx);
```

---

### 🔄 `useSession()`

Middleware for **loading session** on every request:

* Reads session cookie
* Loads session data from storage
* Adds `ctx.session` to your context.

Example:

```ts
app.use(sessionManager.useSession());
```

---

### ❌ `destroySession()`

Deletes the session from storage and removes the cookie:

```ts
await sessionManager.destroySession(sessionId);
```

---

## 🔧 Configuration Options

```ts
const sessionManager = new SessionManager({
  sessionName: "my_session",
  cookie: {
    maxAge: 1000 * 60 * 30, // 30 min
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  },
  storage: new MemoryStore(), // Or your own adapter
});
```

| Option          | Type                    | Description                            |
| --------------- | ----------------------- | -------------------------------------- |
| sessionName     | `string`                | Name of the cookie key                 |
| sessionId       | `(ctx) => string`       | Custom session ID generator (optional) |
| cookie.maxAge   | `number`                | Expiry in ms                           |
| cookie.secure   | `boolean`               | Only send cookie on HTTPS              |
| cookie.httpOnly | `boolean`               | Prevent JS access to cookie            |
| cookie.sameSite | `"lax" \| "strict" \| "none"` | SameSite attribute             |
| storage         | `SessionStorageAdapter` | Custom storage engine                  |

---

## 🧰 Example with Redis Storage

```ts

import type { SessionStorageAdapter, SessionInstance } from "@tezx/session";
import type { RedisClientType } from "redis";

export class RedisStore implements SessionStorageAdapter {
  private redisClient: RedisClientType;
  private prefix: string;

  /**
   * Create RedisStore adapter.
   * @param redisClient - Connected Redis client instance.
   * @param prefix - Optional key prefix for session keys.
   */
  constructor(redisClient: RedisClientType, prefix = "tezx:session:") {
    this.redisClient = redisClient;
    this.prefix = prefix;
  }

  private getKey(sessionId: string) {
    return `${this.prefix}${sessionId}`;
  }

  async get(sessionId: string): Promise<SessionInstance | undefined> {
    const key = this.getKey(sessionId);
    const data = await this.redisClient.get(key);
    if (!data) return undefined;

    try {
      const parsed = JSON.parse(data);
      const redisStore = this;
      return {
        sessionId: parsed.sessionId,
        data: parsed.data,
        async save() {
          await redisStore.set(this.sessionId, this);
        },
        async destroy() {
          await redisStore.destroy(this.sessionId);
        },
      } as SessionInstance;
    } catch {
      return undefined;
    }
  }

  async set(sessionId: string, data: SessionInstance, maxAge?: number): Promise<void> {
    const key = this.getKey(sessionId);
    const value = JSON.stringify({ sessionId, data: data.data });
    if (maxAge) {
      // maxAge in ms, Redis EXPIRE in seconds
      await this.redisClient.set(key, value, {
        PX: maxAge,
      });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async destroy(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.redisClient.del(key);
  }
}

const redisStore = new RedisStore(redisClient);

const sessionManager = new SessionManager({
  storage: redisStore,
  cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
});
```

---

## ⚠️ CORS & Cookie Notes

For frontend requests (if CORS enabled):

* Set credentials in the fetch request:

```js
fetch("/profile", { credentials: "include" });
```

* Server-side: Configure CORS to allow credentials and the origin.

---

## 🔨 Type Safety

```ts
const sessionManager = new SessionManager<{ userId: number, role: string }>();

await sessionManager.createSession({ userId: 1, role: "admin" }, ctx);
```

Now your `ctx.session.data` will always have `userId` and `role`.

---

## 🔮 Advanced Topics

* Redis, MongoDB, File storage adapters
* Regenerate session IDs on login/logout
* Auto session expiry + cleanup
* Session encryption for sensitive data
* Shared session across subdomains

---

## ✅ License

MIT © TezX

---
