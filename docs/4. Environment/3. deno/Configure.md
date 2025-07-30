# 🚀 TezX with Deno — Developer Guide

Build modern, high-performance HTTP applications using the TezX framework on Deno.

---

## ✅ Prerequisites

* [Deno](https://deno.land) installed (v1.44+ recommended)
* Basic knowledge of Deno’s permissions and module system
* TezX app instance (`app`) created in `src/index.ts`

---

## 🛠️ Setup: `server.ts`

```ts
// server.ts
import { loadEnv } from "tezx/deno";
import { app } from "./src/index.ts";

// Load environment variables from `.env` and `.env.local`
await loadEnv();

// Start the HTTP server
Deno.serve({ port: Number(Deno.env.get("PORT") || 5000) }, (req, connInfo) => {
  return app.serve(req, connInfo);
});
```

---

## 📁 Project Structure

```bash
my-tezx-project/
├── src/
│   └── index.ts        # Your TezX app instance
├── .env                # Environment variables
├── server.ts           # Entry point
```

---

## 📦 Environment Variables (`.env`)

```env
PORT=5000
APP_NAME=MyDenoTezXApp
```

TezX will automatically load:

* `.env`
* `.env.local` (if exists)

These are injected into both `Deno.env` and `process.env` (polyfilled where applicable).

---

## 📌 Accessing Env Variables

```ts
const port = Number(Deno.env.get("PORT") || 5000);
const appName = Deno.env.get("APP_NAME");
```

---

## 📝 Deno Permissions

To use `.env` and serve HTTP, ensure the following permissions:

```bash
deno run --allow-net --allow-env --allow-read server.ts
```

Alternatively, for full access during development:

```bash
deno run --allow-all server.ts
```

---

## 🔁 Live Development (with Watch)

```bash
deno run --watch --allow-all server.ts
```

---

## 📦 Optional: Use with NPM via `npm:` specifier

If you're integrating with an NPM-style toolchain or writing hybrid code:

```ts
import { loadEnv } from "npm:tezx/deno";
```

---

## 🔧 Pro Tip: Create a Run Script

Add to your `deno.json` for easier use:

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-all server.ts",
    "start": "deno run --allow-all server.ts"
  }
}
```

Then run with:

```bash
deno task dev
```

---

## 📚 Additional Docs

* TezX Docs: *coming soon*
* Deno Docs: [https://deno.land/manual](https://deno.land/manual)
* Deno Permissions: [https://deno.land/manual@latest/basics/permissions](https://deno.land/manual@latest/basics/permissions)

---
