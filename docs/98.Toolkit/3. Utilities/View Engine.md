# @tezx/view-engine

A flexible, powerful, and runtime-aware view engine utility for server-side rendering (SSR) with support for **Node.js**, **Bun**, and **Deno**.

**Latest Version:** ![npm version](https://img.shields.io/npm/v/@tezx/view-engine.svg)

> 🔧 Supports `ejs`, `pug`, `handlebars`, `nunjucks`, and `mustache` templates out of the box.

---

## ✨ Features

- ✅ Supports multiple template engines
- 🧠 Built-in caching for improved performance
- 🪄 Optional file extension overrides
- 🌐 Cross-runtime support: Node.js, Bun, Deno
- 📦 Lightweight and framework-agnostic
- 🔍 Ideal for SSR in Tezx or any TS/JS backend

---

## 📦 Installation

```bash
npm install @tezx/view-engine
# or
bun add @tezx/view-engine
````

### **Template**

```bash
npm create tezx view-engine -- --template view-engine --y
```

### **Require**

```bash
# EJS
npm install ejs

# Pug (formerly Jade)
npm install pug

# Handlebars
npm install handlebars

# Nunjucks (Jinja2-like templating)
npm install nunjucks

# Mustache
npm install mustache

```

---

## 🚀 Usage

```ts
import { ViewEngine } from "@tezx/view-engine";

const views = new ViewEngine("ejs", "./views");

const html = await views.render("home", {
  title: "Welcome!",
  user: { name: "Rakibul" },
});

// In your Tezx handler:
ctx.html(html);
```

---

## 🔧 Constructor

```ts
new ViewEngine(engine: TemplateEngine, viewsPath: string, options?: ViewEngineOptions)
```

### Parameters

| Name        | Type                   | Description                        |
| ----------- | ---------------------- | ---------------------------------- |
| `engine`    | `"ejs"`, `"pug"`, etc. | Template engine to use             |
| `viewsPath` | `string`               | Path to the views/templates folder |
| `options`   | `ViewEngineOptions`    | (Optional) Configuration options   |

---

## ⚙️ Options

```ts
interface ViewEngineOptions {
  cache?: boolean; // default: true
  autoescape?: boolean; // default: true (nunjucks only)
  extensionOverride?: Partial<Record<TemplateEngine, string>>;
}
```

### Example

```ts
const views = new ViewEngine("ejs", "./views", {
  cache: true,
  extensionOverride: {
    ejs: ".html.ejs"
  }
});
```

---

## 📚 Supported Engines

| Engine       | Extension   | Notes                       |
| ------------ | ----------- | --------------------------- |
| `ejs`        | `.ejs`      | Supports includes/partials  |
| `pug`        | `.pug`      | Indentation-based templates |
| `handlebars` | `.hbs`      | Logic-less templates        |
| `nunjucks`   | `.njk`      | Powerful and Django-like    |
| `mustache`   | `.mustache` | Minimal and logic-less      |

---

## 🧠 Runtime Compatibility

| Runtime | Supported  | Notes                     |
| ------- | ---------- | ------------------------- |
| Node.js | ✅          | Recommended               |
| Bun     | ✅          | Fully supported           |
| Deno     | ✅          | Fully supported           |

---

## 📂 Example View Structure

```
views/
├── home.ejs
├── layout.pug
├── about.hbs
├── user/
│   └── profile.mustache
```

---

## ✅ Also include in your `docs/` folder

You can save this as:

```bash
/docs/view-engine.md
````

or

```bash
README.md → root of helpers/view-engine/
```
