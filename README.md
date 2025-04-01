
---

# TezX - High-Performance Backend Framework

TezX is a high-performance backend framework designed for building scalable and efficient web applications. This README provides detailed installation instructions and usage information for setting up your project with TezX.

## Features

- Lightweight and fast
- Built-in static file serving
- Easy-to-use routing
- Flexible logger integration
- Simple API for creating web applications
- Fully customizable to fit your needs

### Steps to Install TezX

Follow these steps to get started with TezX:

1. **Clone Repository**:

```bash
   git clone https://github.com/tezxjs/tezx-app-example
```

2. **Install latest `tezx`**:

```bash
   npm install tezx@latest
```

3. **Run Project**:

```bash
npm run dev
```

This will start the TezX server on **<http://localhost:3001>**.

## **NodeJS**

Add **`package.json`**

```json
"scripts": {
    "build": "npx pkgroll --clean-dist",
    "start": "node dist/index.js",
    "nodemon": "nodemon src/index.ts",
    "dev": "tsx watch src/index.ts"
}
```

## **Bun**

Add **`package.json`**

```json
"scripts": {
    "dev": "bun run --hot --watch src/index.ts",
}
```

**`src/index.ts`**

```ts
bunAdapter(app).listen(3001, (message) => {
    console.log(message)
})
```

## **Deno**

Add **`package.json`**

```json
"scripts": {
    "dev": "deno run --watch --allow-net  --allow-read --allow-env --unstable-sloppy-imports src/index.ts",
}
```

**`src/index.ts`**

```ts
denoAdapter(app).listen(3001, (message) => {
    console.log(message)
})
```

## License

TezX is released under the MIT License. See LICENSE for more information.

---
