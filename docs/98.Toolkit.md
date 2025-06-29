
---

# TezX Toolkit

The **TezX Toolkit** provides a powerful set of modular middlewares and developer utilities tailored for TezX-based applications. Whether you're building APIs, handling authentication, or inspecting app internals, these tools help you move fast and build with confidence.

---

## 🌐 Available Middlewares

### 🔐 Google OAuth2

Authenticate users with Google using the lightweight and flexible [`@tezx/google-oauth2`](https://www.npmjs.com/package/@tezx/google-oauth2) middleware. It simplifies the OAuth2 flow and integrates smoothly with TezX routing.

**Latest Version:** ![npm version](https://img.shields.io/npm/v/@tezx/google-oauth2.svg)

```bash
npm install @tezx/google-oauth2
# or
yarn add @tezx/google-oauth2
```

#### **Template**

```bash
npm create tezx google-auth -- --template google-oauth2 --y
```

---

### 🐱 GitHub OAuth2

Add GitHub login to your TezX app effortlessly with [`@tezx/github-oauth2`](https://www.npmjs.com/package/@tezx/github-oauth2). Ideal for developer tools, dashboards, and more.

**Latest Version:** ![npm version](https://img.shields.io/npm/v/@tezx/github-oauth2.svg)

```bash
npm install @tezx/github-oauth2
# or
yarn add @tezx/github-oauth2
```

#### **Template**

```bash
npm create tezx github-oauth -- --template github-oauth2 --y
```

---

## 🛠️ Helpers & Utilities

### 🧪 DevTools

The [`@tezx/devtools`](https://www.npmjs.com/package/@tezx/devtools) package offers a real-time web interface for inspecting routes, middleware, `.env` variables, and more — all within your running TezX server. Plug it in during development and get instant visibility.

**Latest Version:** ![npm version](https://img.shields.io/npm/v/@tezx/devtools.svg)

```bash
npm install @tezx/devtools
# or
yarn add @tezx/devtools
```

Use with your TezX app:

```ts
import { DevTools } from "@tezx/devtools";

app.get("/devtools", DevTools(app, {
  // Optional:
  // extraTabs(ctx) {
  //   return [
  //     {
  //       tab: "custom",
  //       label: "My Tab",
  //       doc_title: "Custom Logic",
  //       content: "<h1>Hello from Custom Tab</h1>"
  //     }
  //   ];
  // }
}));
```

---

## 🤝 Contributing

We love contributions! Visit individual package repositories for detailed contribution guidelines, issues, and PRs.

Want to suggest a middleware idea? Open an issue in the [main TezX repository](https://github.com/tezxjs/tezx).

---
