# ⚡ TezX – High-Performance JavaScript Framework for **Bun**

**TezX** is a modern, ultra-fast, and lightweight JavaScript framework built specifically for **Bun**.
With a clean API, powerful routing, WebSocket support, middleware stacking, and native static file serving — TezX helps you build scalable applications with unmatched speed.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/tezxjs/TezX)

---

## 🚀 Why TezX (Built for Bun)?

* ⚡ **Blazing Fast** — Fully optimized for Bun’s event loop & native performance.
* 🧩 **Minimal, Clean API** — Developer-friendly and intuitive.
* 🗂 **Native Static Serving** — No external dependencies needed.
* 🔌 **Powerful Middleware Engine** — Compose any logic effortlessly.
* 🧭 **Advanced Routing** — Dynamic, nested, and pattern-based.
* 🔐 **Secure by Default** — Built-in safe context handling.
* 📡 **WebSocket Support** — Real-time apps made easy with `wsHandlers`.
* ♻️ **Multi-Process Ready** — Via Bun’s `reusePort`.

---

## 📦 Installation

```bash
bun add tezx
# or
npm install tezx
```

---

## ⚡ Quick Start (Bun)

```ts
import { TezX } from "tezx";
import { logger } from "tezx/middleware";
import { serveStatic } from "tezx/static";
import { wsHandlers } from "tezx/ws";

const app = new TezX();

// Middlewares
app.use(logger());

// Static files
app.static(serveStatic("/", "./static"));

// Server
const port = Number(process.env.PORT) || 3001;

Bun.serve({
  port,
  reusePort: true,
  fetch(req, server) {
    return app.serve(req, server);
  },
  websocket: wsHandlers({
    // Optional WebSocket config
  }),
});

console.log(`🚀 TezX server running at http://localhost:${port}`);
```

---

## ▶ Run the Server

```bash
bun run server.ts
```

---

## 🔌 Middleware Example

```ts
app.use((ctx, next) => {
  console.log("➡ Request:", ctx.req.url);
  return next();
});
```

---

## 🗂 Static File Serving

```ts
import { serveStatic } from "tezx/static";

app.static(serveStatic("/assets", "./assets"));
```

Access via:

```bash
http://localhost:3001/assets/your-file.ext
```

---

## 🧭 Routing

```ts

app.post("/contact", async (ctx) => {
  const body = await ctx.json();
  return ctx.json({ received: body });
});
```

---

## ⚠️ Error Handling

```ts
app.onError((err, ctx) => {
  return ctx.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});
```

---

## 🧪 Development Setup

### `dev` script for Bun

**package.json**

```json
{
  "scripts": {
    "dev": "bun run --hot --watch src/index.ts"
  }
}
```

### Example: `src/index.ts`

```ts
import app from "./app";

Bun.serve({
  port: 3001,
  reusePort: true,
  fetch(req, server) {
    return app.serve(req, server);
  },
});
```

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a pull request

👉 GitHub: **[https://github.com/tezxjs](https://github.com/tezxjs)**

---

## 💖 Support TezX

If TezX helps you, consider supporting:

* ⭐ Star on GitHub
* 💸 Sponsor on GitHub: [https://github.com/sponsors/srakib17](https://github.com/sponsors/srakib17)

Your support helps improve the framework.

---

## 🙌 Sponsor

<a href="http://papernxt.com" target="_blank">
  <img
  src="https://papernxt.com/favicon.ico"
  width="48"
  hight="48"
  alt="papernxt.com"
  title="papernxt.com"
  />
</a>

---

## 📜 License

Licensed under the **MIT License**.

---
