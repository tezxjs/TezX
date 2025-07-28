
# 🔧 TezX with Node.js – Full Integration Guide (`mountTezXOnNode`)

Build modern, middleware-driven APIs in Node.js using **TezX**, a lightweight server framework with first-class support for the Fetch API and native HTTP integration.

---

## ✅ Prerequisites

* [Node.js](https://nodejs.org/) v16 or higher
* TezX installed via `npm`, `yarn`, or `pnpm`

```bash
# Choose your preferred package manager
npm install tezx
# or
yarn add tezx
# or
pnpm add tezx
```

---

## 🗂️ Recommended Project Structure

```bash
project/
├── src/
│   └── app.ts          # TezX app instance
├── server.ts           # Native Node.js HTTP server
├── .env                # Environment config
```

---

## 🚀 Setting Up the Server (`server.ts`)

```ts
import { createServer } from "http";
import { mountTezXOnNode, loadEnv } from "tezx/node";
import { app } from "./src/app";

// Load environment variables from `.env` into process.env
loadEnv();

// Create a native HTTP server
const server = createServer();

// Mount TezX to handle requests
mountTezXOnNode(app, server);

// Start listening on the defined port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 TezX is running at http://localhost:${PORT}`);
});
```

---

## 📄 Example `.env`

```env
PORT=3000
```

> Loaded via `loadEnv()` and available as `process.env.PORT`

---

## 🧪 Running the Server

```bash
node server.ts
# or with live-reloading (recommended for dev)
npx nodemon server.ts
```

---

## 🧠 What Does `mountTezXOnNode` Do?

`mountTezXOnNode(app, server)` enables TezX to work natively with Node.js by:

* 🔁 **Transforming** Node’s `IncomingMessage` into a Fetch-compatible `Request`
* 📤 **Passing** the request to your TezX app via `app.serve()`
* 📥 **Converting** the Fetch `Response` back into a native HTTP response
* 🚰 **Supporting** streaming (files, JSON, Server-Sent Events)
* 🛡️ **Handling** edge cases like errors and connection aborts cleanly

---

## 📚 Feature Breakdown

| Feature                        | Description                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| `createServer()`               | Standard Node.js HTTP server                                         |
| `mountTezXOnNode(app, server)` | Binds your TezX app to the server                                    |
| Request conversion             | `IncomingMessage` → Fetch `Request`                                  |
| Response conversion            | Fetch `Response` → `ServerResponse` (with stream support)            |
| Streaming & SSE support        | Handles large or continuous data (e.g., file download, live updates) |
| Error handling                 | Graceful 500 responses and logging                                   |
| `.env` support via `loadEnv()` | Automatically loads environment variables                            |
| Compatibility                  | Works with HTTP/1.x and HTTP/2 servers in Node.js                    |

---

## ✅ Benefits

* 🔧 Native Node.js support without needing adapters
* ✨ Clean Fetch API interface (like Deno or Bun)
* 🧱 Minimal boilerplate, ideal for microservices or APIs
* 🌊 Streaming-ready (e.g., `ctx.stream()`, SSE, large files)
* 🧩 Works with existing Node.js tooling (e.g., Nodemon, PM2, ts-node)

---

## 🔁 Next Steps

* Add routes using `.get()`, `.post()`, `.use()` on your `app` instance
* Integrate `middleware`, `env`, and `logging` for full control
* Explore WebSocket support (if using Bun/Deno) or custom WS handlers for Node.js

---
