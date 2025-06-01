
## 📘 TrieRouter Compatibility & Behavior Guide

---

### 🧩 **Route Types Supported**

| Route Type        | Example Path              | Matched URL        | Params Returned                       |
| ----------------- | ------------------------- | ------------------ | ------------------------------------- |
| Static            | `/about`                  | `/about`           | `{}`                                  |
| Dynamic Segment   | `/:slug`                  | `/hello`           | `{ slug: "hello" }`                   |
| Deep Static Path  | `/docs/list/all`          | `/docs/list/all`   | `{}`                                  |
| Deep Dynamic Path | `/user/:id/profile`       | `/user/42/profile` | `{ id: "42" }`                        |
| Mixed Path        | `/blog/:category/:postId` | `/blog/tech/123`   | `{ category: "tech", postId: "123" }` |

---

### 🔀 **Routing Priority**

Routing matches in **priority order**:

1. **Exact Static Paths**
2. **Dynamic Parameters (e.g., `:slug`)**

➡️ Example:

```ts
app.get('/test', ...)           // matched for `/test`
app.get('/:slug', ...)          // matched for `/about`, `/contact`
```

> ✅ `/test` will not be matched by `/:slug` if `/test` route is defined.

```ts
app.get('/test/1', ...)           // matched for `/test` -> Not Found
app.get('/:slug', ...)          // matched for `/about`, `/contact` without /`test`
```

---

### 🧪 **Route Matching Logic (Simplified)**

```ts
- Split pathname by `/`
- Traverse Trie:
    - If node has static match → follow
    - Else if node has `:` dynamic param → follow, store param
    - Else → 404
- At end, match handler by method
```

---

### 🛡️ Example Use

```ts
app.get('/docs/:id', (ctx) => {
  const id = ctx.req.params.id;
  return ctx.json({ docId: id });
});
```

Requesting `/docs/45` returns:

```json
{ "docId": "45" }
```
