## `getConnInfo` Middleware

Extract and attach the **connection (IP) information** from the incoming HTTP request to the request context (`ctx.req.remoteAddress`).

Supports `Bun`, `Node.js`, and `Deno` runtime environments.

---

### 🔧 Usage

```ts
import { getConnInfo } from "tezx/bun"; // or "tezx/node", "tezx/deno"

app.use(getConnInfo());
```

---

### 📥 What It Does

* Reads connection details (IP address, port, protocol family) from the request socket
* Adds a `remoteAddress` property to `ctx.req`:

  ```ts
  ctx.req.remoteAddress = {
    address: string; // e.g., "127.0.0.1"
    port: number;    // e.g., 54321
    family: string;  // e.g., "IPv4"
  };
  ```

---

### 📤 Access in Route Handlers

```ts
router.get("/", (ctx) => {
  const ip = ctx.req.remoteAddress?.address;
  return new Response(`Your IP address is: ${ip}`);
});
```

---

### 🧠 Type Definition

```ts
type RemoteAddress = {
  address: string;
  port: number;
  family: string;
};

```

---

### 🧩 Compatibility

| Runtime | Supported | Notes                        |
| ------- | --------- | ---------------------------- |
| Bun     | ✅         | Native support via `.socket` |
| Node.js | ✅         | Uses `req.socket`            |
| Deno    | ✅         | Uses Deno’s conn info APIs   |

---

### ⚠️ Notes

* This middleware must be registered **early**, before route matching, to ensure availability in all handlers.
* In serverless or proxy-based deployments (e.g., Vercel, Netlify, NGINX), use `X-Forwarded-For` headers instead to get client IPs.

---

### 📁 Example Project Structure

```bash
- server.ts
- middlewares/
    └── getConnInfo.ts
- routes/
    └── index.ts
```

---

### 📚 Related

* `ctx.req` – Incoming request object
* `ctx.res` – Response object
* `app.use()` – Middleware registration
