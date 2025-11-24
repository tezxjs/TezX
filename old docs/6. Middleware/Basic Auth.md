# 🔐 Basic Authentication Middleware (`basicAuth`)

The `basicAuth` middleware enforces **HTTP Basic Authentication** on incoming requests.
It verifies the `Authorization: Basic ...` header, validates credentials, and rejects unauthorized clients.

---

## ✅ When to Use

* Protect admin routes (e.g., `/admin`, `/dashboard`).
* Secure APIs during development/testing without setting up OAuth/JWT.
* Quickly add a login wall for staging servers.

---

## 📦 Import

```ts
import {basicAuth} from "tezx/middleware";
```

---

## ⚙️ Options

```ts
export type BasicAuthOptions = {
  /**
   * Function to validate credentials.
   */
  validate: (
    username: string,
    password: string,
    ctx: Context
  ) => boolean | Promise<boolean>;

  /**
   * Authentication realm (shown in browser login popup).
   * @default "Restricted Area"
   */
  realm?: string;

  /**
   * Custom handler when authentication fails.
   * Must return an HttpBaseResponse.
   */
  onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;
};
```

---

## 🛠️ Usage Example

### 1. Simple Static Credentials

```ts
import {basicAuth} from "tezx/middleware";

const auth = basicAuth({
  validate: (username, password) =>
    username === "admin" && password === "secret",
});
```

```ts
// Use in your route
app.use("/admin", auth, (ctx) => {
  ctx.json({ message: "Welcome, admin!" });
});
```

---

### 2. Async Validation (e.g., Database)

```ts
const auth = basicAuth({
  validate: async (username, password, ctx) => {
    const user = await db.users.findOne({ username });
    return user && user.passwordHash === hash(password);
  },
});
```

---

### 3. Custom Unauthorized Handler

```ts
const auth = basicAuth({
  validate: (u, p) => u === "demo" && p === "demo",
  onUnauthorized: (ctx, error) => {
    ctx.setStatus = 401;
    return ctx.json({ error: "Access denied", reason: error?.message });
  },
});
```

---

## 🔄 How It Works

1. Reads the `Authorization` header.
2. Ensures it starts with `Basic`.
3. Decodes the Base64 credentials into `username:password`.
4. Calls your `validate(username, password, ctx)`.
5. * ✅ If valid → attaches `ctx.user = { username }` and continues.
   * ❌ If invalid → calls `onUnauthorized` and ends the request.

---

## 🧑‍💻 Accessing Authenticated User

```ts
app.get("/profile", auth, (ctx) => {
  const user = (ctx as any).user;
  return ctx.json({ message: `Hello ${user.username}` });
});
```

---

## ⚠️ Notes

* Credentials are sent **on every request** in Base64 (not secure unless using HTTPS).
* For production, prefer JWT, OAuth2, or session-based auth.
* `realm` value appears in the browser’s login popup.

---
