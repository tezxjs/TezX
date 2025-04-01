# TezX - High-Performance JavaScript Framework

TezX is a cutting-edge, high-performance, and lightweight JavaScript framework designed for speed, scalability, and flexibility. Built with modern web development needs in mind, TezX enables efficient routing, middleware management, and static file serving with minimal configuration. It is fully compatible with **Node.js, Deno, and Bun**, making it a truly cross-environment framework.

## 🚀 Key Features

- **High Performance:** Optimized for speed and scalability.
- **Minimal & Intuitive API:** Simple yet powerful.
- **Built-in Static File Serving:** No additional setup required.
- **Robust Middleware Support:** Easily extend functionality.
- **Dynamic & Flexible Routing:** Define routes with ease.
- **Security First:** Designed with security best practices.
- **Efficient HTTP Handling:** Built for high concurrency.
- **Cross-Environment Support:** Works with **Node.js, Deno, and Bun**.

## 📦 Installation

### Node.js

```bash
npm install tezx
```

or using Yarn:

```bash
yarn add tezx
```

<!-- ### Deno

```typescript
import { TezX } from "https://deno.land/x/tezx/mod.ts";
``` -->

### Bun

```bash
bun add tezx
```

## 🚀 Quick Start

Create a simple TezX server:

```javascript
import { logger, nodeAdapter, TezX } from "tezx";

const app = new TezX({ logger });

app.static("/", "./static");

app.get("/", (ctx) => {
    return ctx.html(`
        <h1>Welcome to TezX</h1>
        <p>A modern, high-performance cross-environment framework.</p>
    `);
});

nodeAdapter(app).listen(3001, (message) => {
    console.log(message);
});
```

## ▶ Running the Server

### Node.js

```bash
node server.js
```

For development with hot-reloading:

```bash
npm install -g nodemon
nodemon server.js
```

### Deno

```bash
deno run --allow-net server.ts
```

### Bun

```bash
bun run server.js
```

## 🛠 Middleware Support

Enhance your application with middleware:

```javascript
app.use((ctx, next) => {
    console.log(`Incoming request: ${ctx.request.url}`);
    return next();
});
```

## 📂 Serving Static Files

```javascript
app.static("/public", "./public");
```

Access static files via `/public/filename.ext`.

## 🔀 Routing

```javascript
app.get("/about", (ctx) => ctx.html("<h1>About Us</h1>"));

app.post("/submit", (ctx) => ctx.json({ message: "Form submitted successfully" })); 
```

## ⚠️ Error Handling

```javascript
app.onError((err, ctx) => {
  return ctx.status(500).json({ error: "Internal Server Error" });
});
```
<!-- 
## 📖 Documentation

For full documentation, visit: [TezX Docs](https://tezx.dev/docs) -->

## 🤝 Contributing

We welcome contributions! Submit issues and pull requests on our GitHub repository.
<!-- 
## 👤 Author

**TezX Team**  
📧 Email: <support@tezx.dev>  
🌐 Website: [https://tezx.dev](https://tezx.dev) -->

## 📜 License

TezX is open-source under the MIT License. See [LICENSE](LICENSE) for details.

---

🚀 **TezX - Build fast, scale faster.**
