
# 🔧 TezX + Bun Integration Guide

## ✅ Prerequisites

Before you begin, ensure the following tools are installed:

* [Bun](https://bun.sh) — A modern all-in-one JavaScript runtime
* [`tezx`](https://www.npmjs.com/package/tezx) — TezX framework for Bun

Install `tezx` via Bun:

```bash
bun add tezx
```

---

## 📁 Project Structure (Example)

```bash
project/
├── src/
│   └── app.ts       # Application logic (TezX app instance)
├── server.ts        # Main server entry point
├── .env             # Environment variables
```

---

## 🌐 Server Setup (with WebSocket Support)

### `server.ts`

```ts
import { loadEnv, wsHandlers} from "tezx/bun";
import { app } from "./src/app"; // TezX app instance

// Load environment variables
loadEnv();

Bun.serve({
  port: 3001,
  reusePort: true, // Enables clustering support
  fetch(req, server) {
    return app.serve(req, server); // TezX handles the request
  },
  websocket: wsHandlers({}),
});

console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
```

---

## 📄 `.env` Example

```env
PORT=3001
```

---

## 🧪 Running the Server

Start the server using Bun:

```bash
bun run --watch server.ts
```

Or simply:

```bash
bun run server.ts
```

---

## 📚 Key Concepts

| Feature            | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `Bun.serve()`      | Launches the HTTP server (analogous to Node.js' `createServer`)               |
| `reusePort: true`  | Enables multi-process (cluster) support for improved scalability              |
| `fetch()` handler  | Main entry point for handling HTTP requests using TezX's `app.serve()`        |
| `websocket` config | Manages the WebSocket lifecycle events such as `open`, `message`, and `close` |
| `ws.data` usage    | Custom logic can be attached per WebSocket session through the `data` field   |
| `loadEnv()`        | Automatically loads environment variables from the `.env` file                |

---
