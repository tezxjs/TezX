# 📊 TezX DevTools

> Developer-friendly diagnostics panel for TezX apps. Inspect routes, middleware, env variables, cookies, and add custom debug tabs.

---

## ✅ Installation

```bash
npm install @tezx/devtools
npm install tezx
```

---

## 🚀 Quick Usage

```ts
import { TezX } from "tezx";
import { nodeAdapter } from "tezx/node";
import DevTools from "@tezx/devtools";

const app = new TezX();

app.get("/devtools", DevTools(app, {
  // Optional
  // disableTabs: ['cookies', 'routes'],
  // extraTabs: (ctx) => [ ... ]
}));

nodeAdapter(app).listen(3000);
```

Visit: **`http://localhost:3000/devtools`**

---

## 🧩 Built-in Tabs

| Tab           | Description                                |
| ------------- | ------------------------------------------ |
| `routes`      | Lists all routes with method, path, source |
| `middlewares` | Shows registered middleware per route      |
| `cookies`     | Parsed request cookies                     |
| `.env`        | Environment variables loaded via `.env`    |

---

## ⚙️ API: `DevTools(app, options)`

```ts
DevTools(app: TezX<any>, options?: Options): Callback
```

### Options

| Option        | Type              | Description       |                       |                 |                    |
| ------------- | ----------------- | ----------------- | --------------------- | --------------- | ------------------ |
| `extraTabs`   | `(ctx) => TabType | Promise<TabType>` | Add custom debug tabs |                 |                    |
| `disableTabs` | `Array<'cookies'  | 'routes'          | '.env'                | 'middlewares'>` | Hide built-in tabs |

---

## 🛠 Add Custom Tabs

```ts
import DevTools, { dumpMiddlewares } from "@tezx/devtools";

app.get("/devtools", DevTools(app, {
  extraTabs(ctx) {
    const rows = dumpMiddlewares(app)
      .map(r => `<tr><td>${r.endpoint}</td><td>${r.pattern}</td><td>${r.appliedMiddlewares}</td></tr>`)
      .join("");
    return [
      {
        tab: "middlewares",
        label: "Middleware Table",
        doc_title: "Middleware Overview",
        content: `<table>${rows}</table>`
      }
    ];
  }
}));
```

---

## 📚 Types

```ts
type Tab = "cookies" | "routes" | ".env" | "middlewares";

type TabType = {
  doc_title: string;
  label: string;
  tab: Tab | string;
  content: string; // HTML content
}[];

type Options = {
  extraTabs?: (ctx: Context) => Promise<TabType> | TabType;
  disableTabs?: Tab[];
};
```

---

## 📁 Directory Structure Example

```bash
my-app/
├── routes/
│   ├── _middleware.ts
│   └── ...
├── public/
│   └── ...
├── .env
├── package.json
└── tsconfig.json
```

---

💡 **Tip:** Use `extraTabs` to create real-time diagnostic panels tailored to your app.

---
