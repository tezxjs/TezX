# Bearer Authentication Middleware (`bearerAuth`)

Middleware to protect routes using **Bearer tokens** (commonly used for JWTs, opaque API tokens, etc.).
It extracts the token from the `Authorization` header, delegates validation to your code, and either continues the pipeline or returns an unauthorized response.

---

## Import

```ts
import { bearerAuth } from "tezx/middleware";
```

---

## Purpose

* Enforce presence of `Authorization: Bearer <token>` header.
* Call user-provided `validate` function to determine token validity.
* Provide a hook to return a custom `HttpBaseResponse` on failure.
* Attach token (or user info) to `ctx` for downstream handlers.

---

## API / Options

```ts
export type BearerAuthOptions = {
  /**
   * Validate function. Return `true` (or a truthy value) if token is valid.
   * Can be synchronous or async.
   */
  validate: (token: string, ctx: Context) => boolean | Promise<boolean>;

  /**
   * Realm shown in `WWW-Authenticate` header. Defaults to "API".
   */
  realm?: string;

  /**
   * Handler invoked on unauthorized access.
   * Must return an `HttpBaseResponse`.
   */
  onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;
};
```

**Default behavior** (when `onUnauthorized` not provided):

* Sets `ctx.setStatus = 401`
* Sets header `WWW-Authenticate: Bearer realm="<realm>"`
* Returns `ctx.json({ error: "<message>" })`

---

## Behavior / Flow

1. Read `authorization` header via `ctx.req.header("authorization")`.
2. If missing or not `Bearer` → call `onUnauthorized` with error `Bearer token required`.
3. Extract token (`auth.slice(7).trim()`).
4. If token empty → `onUnauthorized` with `Empty token`.
5. Call `await validate(token, ctx)`.

   * If false → `onUnauthorized` with `Invalid or expired token`.
   * If true → attach `(ctx as any).token = token` and call `next()`.

Errors thrown inside `validate` are caught and passed to `onUnauthorized`.

---

## Examples

### 1) Simple synchronous token check

```ts
const auth = bearerAuth({
  validate: (token) => token === "dev-secret-token"
});

app.use("/protected", auth, (ctx) => {
  ctx.json({ ok: true });
});
```

### 2) Async check (DB / cache)

```ts
const auth = bearerAuth({
  validate: async (token) => {
    const record = await db.tokens.findOne({ token });
    return !!record && !record.revoked && record.expiresAt > Date.now();
  }
});
```

### 3) JWT verification example

```ts
import jwt from "jsonwebtoken";

const auth = bearerAuth({
  validate: async (token, ctx) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // attach decoded user for downstream handlers
      (ctx as any).user = payload;
      return true;
    } catch {
      return false;
    }
  },
});
```

### 4) Custom `onUnauthorized`

```ts
const auth = bearerAuth({
  validate: async (t) => verifyTokenSomehow(t),
  onUnauthorized: (ctx, error) => {
    ctx.setStatus = 401;
    ctx.setHeader("WWW-Authenticate", `Bearer realm="API"`);
    // Return a custom HttpBaseResponse (or ctx.json)
    return ctx.json({ error: "Auth failed", reason: error?.message });
  }
});
```

---

## How to access validated token / user

Downstream handlers can read the token (or attached user info):

```ts
app.get("/me", auth, (ctx) => {
  const token = (ctx as any).token; // raw token string
  const user = (ctx as any).user;   // if you attached user in validate()
  ctx.json({ token, user });
});
```

---

## Security Notes

* **Always use HTTPS** — Bearer tokens sent in plaintext over HTTP are vulnerable.
* Tokens are sent on every request; prefer short-lived tokens + refresh strategy or signed tokens (JWT).
* Don’t log full tokens in production.
* If validating JWTs, verify signature, issuer, audience, and expiry.

---

## Edge Cases & Recommendations

* Header casing: `ctx.req.header("authorization")` should handle typical casing; if not, fallback to `Authorization`.
* Multiple auth schemes: if you support Basic/API-Key, ensure middleware ordering or combine into a flexible auth middleware.
* If `validate` attaches heavy objects to `ctx`, prefer a sanitized `ctx.user` structure.
* For streaming responses, nothing special is needed; this middleware runs before response generation.

---

## Testing Tips

* Unit test both success and failure flows:

  * Missing header
  * `Authorization: Bearer` (empty token)
  * Invalid token
  * `validate` throwing an error
  * Valid token attaches `token` / `user` and calls `next()`
* Mock `ctx.req.header` and `ctx.json` when testing in isolation.
* Integration tests: issue HTTP requests with `Authorization` header to protected endpoints.

---

## Example: Full usage with Express-like pseudo-app

```ts
const auth = bearerAuth({
  validate: async (token, ctx) => {
    // Example: decode jwt + attach user
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      (ctx as any).user = payload;
      return true;
    } catch {
      return false;
    }
  },
});

app.use("/api", auth);

app.get("/api/profile", (ctx) => {
  const user = (ctx as any).user;
  return ctx.json({ user });
});
```

---

## Troubleshooting

* If requests always fail: ensure the `Authorization` header is present and not stripped by proxies. Check `Authorization` vs `authorization` handling.
* If `validate` never runs: confirm the middleware is registered for the correct route and that other middleware isn’t short-circuiting.
* If `onUnauthorized` returns unexpected shape: ensure it returns the `HttpBaseResponse` expected by your framework or uses `ctx.json()`.

---
