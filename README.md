# ⚡ TezX – High-Performance JavaScript Framework

**TezX** is a modern, high-performance, and lightweight JavaScript framework designed for speed, scalability, and cross-environment compatibility. It offers an intuitive API for routing, middleware management, and static file serving—making it ideal for building web applications with **Node.js**, **Deno**, and **Bun**.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/tezxjs/TezX)

---

## 🚀 Features at a Glance

- ⚡ **Ultra-Fast Performance** – Built for speed and concurrency.
- 🧩 **Minimal & Intuitive API** – Clean and easy to use.
- 🗂 **Static File Serving** – Serve files with a single command.
- 🔌 **Middleware Support** – Stack and compose custom logic.
- 🧭 **Flexible Routing** – Dynamic and pattern-based routing.
- 🔐 **Security-First Design** – Secure by default.
- 📡 **Efficient HTTP Engine** – High-concurrency request handling.
- 🌍 **Cross-Environment** – Works with Node.js, Deno, and Bun.

---

## 📦 Installation

### Node.js

```bash
npm install tezx
# or
yarn add tezx
```

### Bun

```bash
bun add tezx
```

<!--
### Deno

```ts
import { TezX } from "https://deno.land/x/tezx/mod.ts";
```
-->

---

## ⚡ Quick Start

```ts
import { TezX } from "tezx";
import { logger } from "tezx/logger";
import { createServer } from "node:http";
import { mountTezXOnNode } from "tezx/node";

const app = new TezX();
app.use(logger());
app.static("/", "./static");

app.get("/", (ctx) =>
  ctx.html(`
    <h1>Welcome to TezX</h1>
    <p>A modern, high-performance, cross-runtime JavaScript framework.</p>
  `)
);

const server = createServer();
mountTezXOnNode(app, server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 TezX is running at http://localhost:${PORT}`);
});
```

---

## ▶ Starting the Server

### Node.js

```bash
node server.js
# or
npm install -g nodemon
nodemon server.js
```

### Bun

```bash
bun run server.js
```

### Deno

```bash
deno run --allow-all server.ts
```

---

## 🔌 Middleware Usage

```ts
app.use((ctx, next) => {
  console.log(`Incoming request: ${ctx.req.url}`);
  return next();
});
```

---

## 🗂 Static File Serving

```ts
app.static("/public", "./public");
```

Accessible via: `http://localhost:3000/public/filename.ext`

---

## 🧭 Routing

```ts
app.get("/about", (ctx) => ctx.html("<h1>About Us</h1>"));

app.post("/submit", (ctx) =>
  ctx.json({ message: "Form submitted successfully" })
);
```

---

## ⚠️ Error Handling

```ts
app.onError((err, ctx) => {
  return ctx.status(500).json({ error: "Internal Server Error" });
});
```

---

## 🧪 Development Setup

### Run Dev Server

```bash
npm run dev
# or
bun run dev
```

Access: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Platform-Specific Scripts

### Node.js – `package.json`

```json
{
  "scripts": {
    "build:esm": "tsc --outDir dist/mjs --removeComments",
    "build:dts": "tsc --outDir dist/types --declaration --emitDeclarationOnly",
    "build": "npm run build:esm && npm run build:dts",
    "start": "node dist/index.js",
    "nodemon": "nodemon src/index.ts",
    "dev": "tsx watch src/index.ts"
  }
}
```

---

### Bun – `package.json`

```json
{
  "scripts": {
    "dev": "bun run --hot --watch src/index.ts"
  }
}
```

#### Example: `src/index.ts`

```ts
Bun.serve({
  port: 3001,
  reusePort: true,
  fetch(req, server) {
    return app.serve(req, server);
  },
  websocket: {
    open(ws) {
      console.log("WebSocket connected");
      return ws.data?.open?.(ws);
    },
    message(ws, msg) {
      return ws.data?.message?.(ws, msg);
    },
    close(ws, code, reason) {
      return ws.data?.close?.(ws, { code, reason });
    },
    ping(ws, data) {
      return ws.data?.ping?.(ws, data);
    },
    pong(ws, data) {
      return ws.data?.pong?.(ws, data);
    },
    drain(ws) {
      return ws.data?.drain?.(ws);
    }
  }
});

console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
```

---

### Deno – `package.json`

```json
{
  "scripts": {
    "dev": "deno run --watch --allow-all --unstable-sloppy-imports src/index.ts"
  }
}
```

#### Example: `src/index.ts`

```ts
Deno.serve({ port: Number(Deno.env.get("PORT") || 5000) }, (req, connInfo) => {
  return app.serve(req, connInfo);
});
```

---

## 🏗 Build & Deployment

### Compile TypeScript

```bash
npm run build
```

Outputs:

- CommonJS (`dist/cjs`)
- ESM (`dist/mjs`)
- Type Declarations (`dist/types`)

---

## 🤝 Contributing

We welcome all contributions! Here's how to get started:

- Fork the repository
- Create a new branch
- Submit a pull request
- Open issues for bugs or ideas

👉 GitHub: [https://github.com/tezxjs](https://github.com/tezxjs)

---

## 💖 Support TezX

TezX is open-source and developed with love. If you find it helpful:

- 🌟 Star the project on [GitHub](https://github.com/tezxjs/TezX)
- 💸 [Sponsor on GitHub](https://github.com/sponsors/srakib17)

<!-- - ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/srakib17) -->

Your support helps improve and maintain TezX for everyone.

---

## 🙌 Sponsor

[![papernxt](https://papernxt.com/favicon.ico)](https://papernxt.com)

---

## 📜 License

This project is licensed under the [MIT License](./package/LICENSE).
