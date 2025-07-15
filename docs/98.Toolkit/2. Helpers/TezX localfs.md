# @tezx/localfs

`@tezx/localfs` is a simple, runtime-agnostic local file storage library that works with Node.js, Deno, and Bun.

It allows you to:

* Save files to the local disk.
* Automatically detect file types.
* Auto-create directories.
* Validate file size & type.
* Generate public URLs for serving files.
* List files (with recursive support).

---

## ✨ Features

* 👍 TypeScript ready
* ✅ Cross-runtime support (Node.js, Deno, Bun)
* 📁 Auto-create directories when saving files
* 🔍 Auto-detect MIME types from file extensions
* ⚙️ Secure file-type filtering based on allowed MIME types
* 🔗 Generate public URLs for serving files
* 🏙️ Public file serving router (TezX Router)
* 📂 List files recursively or non-recursively
* 🧩 Built-in TezX Router for serving static files

---

## 📦 Installation

### Node.js / Bun

```bash
npm install @tezx/localfs
# OR
bun add @tezx/localfs
```

---

## 🔧 Basic Example (Node.js)

```ts
import { LocalFS } from "@tezx/localfs";
import { readFile } from "node:fs/promises";

const storage = new LocalFS({
  basePath: "uploads",
  publicUrl: "/uploads",
  allowedTypes: ["image/*", "application/pdf"]
});

async function run() {
  const buffer = await readFile("photo.jpg");

  const saved = await storage.saveFile("photo.jpg", buffer);
  console.log("File saved:", saved);

  const files = await storage.listFiles("", true);
  console.log("All files:", files);
}

run();
```

---

## 🔹 API Reference

### new LocalFS(options)

| Option               | Type       | Default    | Description                    |
| -------------------- | ---------- | ---------- | ------------------------------ |
| basePath             | `string`   | `uploads`  | Folder to save files           |
| publicUrl            | `string`   | `/uploads` | Public path prefix             |
| allowPublicAccess    | `boolean`  | `true`     | Enable/disable public serving  |
| autoRenameOnConflict | `boolean`  | `true`     | Rename files if name conflicts |
| maxFileSize          | `number`   | `5MB`      | Max upload size in bytes       |
| allowedTypes         | `string[]` | `image/*`  | Allowed MIME types             |

---

### saveFile(fileName, buffer, mimeType?)

Saves a file to the storage.

Returns:

```json
{
  "savedPath": "uploads/photo.jpg",
  "fileName": "photo.jpg",
  "publicUrl": "/uploads/photo.jpg"
}
```

---

### readFile(fileName)

Reads file contents as a `Buffer`.

---

### deleteFile(fileName)

Deletes a file from the disk.

---

### listFiles(folder = '', recursive = false)

Lists file names from a folder.

Example output:

```json
[
  "photo.jpg",
  "nested/file.pdf"
]
```

---

### getPublicUrl(fileName)

Generates the public URL for a file.

Example:

```ts
storage.getPublicUrl("photo.jpg");
// "/uploads/photo.jpg"
```

---

### serveFileResponse()

Returns a TezX Router instance to serve static files from your storage folder.

Example:

```ts
app.use(storage.serveFileResponse());
```

Then files are available at:

```bash
/uploads/photo.jpg
```

---

## 🌐 Example Use with TezX API Router

```ts
app.post("/upload", async (ctx) => {
  const formData = await ctx.req.formData();
  const file = formData?.files;

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storage.saveFile(file.name, buffer);

  return ctx.json(result);
});

app.use(storage.serveFileResponse());
```

---

## 🔹 Runtime Support

| Runtime | Supported |
| ------- | --------- |
| Node.js | ✅         |
| Deno    | ✅         |
| Bun     | ✅         |

---

# LocalFS Usage Docs

## 🔹 Setup

```ts
const storage = new LocalFS({
  basePath: "uploads",
  publicUrl: "/uploads",
  allowedTypes: ["image/*", "application/pdf"]
});
```

## 📂 Saving a File

```ts
const buffer = await readFile("./logo.png");
const saved = await storage.saveFile("logo.png", buffer);
console.log(saved);
```

---

## 🔹 Listing Files

```ts
await storage.listFiles(); // Non-recursive
await storage.listFiles("", true); // Recursive
```

---

## 🔹 Deleting Files

```ts
await storage.deleteFile("logo.png");
```

---

## 🔹 Reading Files

```ts
const content = await storage.readFile("logo.png");
```

---

## 🔹 Serving Public Files

```ts
app.use(storage.serveFileResponse());

// Now accessible at: /uploads/logo.png
```

---

## 🔹 Error Example

```bash
Error: File type application/x-sh is not allowed
```

---
