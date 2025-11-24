# 🔐 @tezx/rbac

A powerful, fully type-safe **Role-Based Access Control (RBAC)** plugin for [TezX](https://www.npmjs.com/package/tezx), designed to help you **control access to routes, APIs, and resources** using simple, template-based permission keys with full IntelliSense support.

---

## 🚀 Highlights

- 🎯 Type-safe permission system (`T extends string[]`)
- 🧠 IntelliSense-based permission enforcement
- 🔁 Multi-role support (`ctx.user.role` can be `string | string[]`)
- ⚙️ Middleware-driven, plug-and-play
- ❌ Built-in denial handling + custom `onDeny()` support
- 🧩 Easy integration with auth middlewares (like `authChecker`)
- 🧪 Battle-tested in production apps
- 🔑 Use role IDs(Dynamically generated, flexible)
- 🔍 Clean merge of all permissions (No manual logic needed)
- 🏷️ Static roles still supported (Easy for default usage)

---

## 📦 Installation

```bash
npm install @tezx/rbac
````

---

## 🧠 How It Works

```bash
[Your Middleware]
    ⬇️ sets ctx.user.role
[RBAC Plugin]
    ⬇️ loads permission map
[Route Guard]
    ⬇️ checks permission key
[✓ ALLOW] or [❌ DENY]
```

---

## ⚠️ Required: `ctx.user.role`

To work correctly, you **must set** `ctx.user.role` before using RBAC.

✅ Example:

```ts
ctx.user = {
  id: 'user_001',
  role: 'admin',  // ✅ Required
  email: 'rakib@example.com'
};
```

✅ If roles can be multiple:

```ts
ctx.user = {
  role: ['editor', 'viewer']
};
```

> 💡 Use `authChecker()` middleware to assign `ctx.user` from token/session.

---

## 🧑‍💻 Usage Example

```ts

import RBAC from '@tezx/rbac';
type Permissions = ['user:create', 'user:delete', 'order:read', 'property:approve'];

const rbac = new RBAC<Permissions>();

app.use(authChecker()); // ✅ Assigns ctx.user + ctx.user.role

app.use(rbac.plugin({
  loadPermissions: async () => ({
    admin: ['user:create', 'user:delete', 'order:read', 'property:approve'],
    editor: ['order:read'],
    guest: []
  })
}));

app.get('/admin/users', rbac.authorize('user:create'), async (ctx) => {
  return ctx.text('You can create users.');
});

```

---

## 📌 RBAC Lifecycle

| Step | Action                                                            |
| ---- | ----------------------------------------------------------------- |
| 1️⃣  | `ctx.user.role` assigned by auth middleware                       |
| 2️⃣  | `rbac.plugin()` loads Role→Permission map                         |
| 3️⃣  | `rbac.authorize('permission:key')` checks merged role permissions |
| 4️⃣  | If not allowed → return `403` (with `onDeny` if provided)         |

---

### 🔁 Replace `role` with Unique Role IDs (Advanced)

RBAC system supports mapping **dynamic role identifiers** (like database IDs or UUIDs) instead of hardcoded role names.

This is helpful when:

- ✅ Roles are created dynamically from a dashboard or DB
- ✅ You want to map user roles like `"role_8FaHq1"` instead of just `"admin"`
- ✅ Permission sets are assigned to these dynamic IDs

#### 🧪 Example

```ts
ctx.user = {
  id: 'user_xyz',
  role: 'role_8FaHq1' // ✅ Your actual role ID from database
};
```

```ts
// Load role-permission map based on DB role IDs
loadPermissions: async () => ({
  role_8FaHq1: ['user:create', 'order:read'],
  role_7NbQt55: ['user:delete']
})
```

> ✅ Internally, `RBAC` merges all permissions based on the provided `ctx.user.role`, whether it's `string` or `string[]`.

#### ⚠️ Important

Make sure the role ID you assign in `ctx.user.role` **exactly matches** the keys in your permission map.

---

### Bonus: Hybrid Role Support

You can even mix static roles with dynamic IDs if needed:

```ts
ctx.user = {
  role: ['admin', 'role_7bXy91']
};

loadPermissions: async () => ({
  admin: ['dashboard:access'],
  role_7bXy91: ['product:create']
});
```

---

## 🧩 Plugin API

### `rbac.plugin(config)`

Initializes the permission map.

**Config options:**

| Field             | Type                         | Required | Description           |
| ----------------- | ---------------------------- | -------- | --------------------- |
| `loadPermissions` | `(ctx) => RolePermissionMap` | ✅        | Role → permission map |
| `isAuthorized`    | `(roles, permissions, ctx)`  | ❌        | Custom check hook     |
| `onDeny`          | `(error, ctx)`               | ❌        | Custom deny response  |

---

### `rbac.authorize('permission:key')`

Middleware to protect routes.

```ts
app.post('/orders', rbac.authorize('order:read'), handler);
```

---

## 💡 IntelliSense with Template Types

```ts
type Permissions = ['user:create', 'order:read', 'admin:panel'];

const rbac = new RBAC<Permissions>();
```

✅ Now `rbac.authorize(...)` will auto-suggest only those permission keys.

---

## ❌ Custom Deny Example

```ts
rbac.plugin({
  loadPermissions: ...,
  onDeny: (error, ctx) => {
    return ctx.json({
      success: false,
      reason: error.message,
      permission: error.permission
    });
  }
});
```

---

## 🔍 Real-World Structure

```ts
const permissionMap = {
  admin: ['user:create', 'user:delete'],
  editor: ['order:read'],
  viewer: [],
};
```

User may have:

```ts
ctx.user = {
  id: 'u-001',
  role: ['editor', 'viewer']
};
```

RBAC will combine permissions from both roles.

---

## 🔥 Debug Tip

To check permissions being applied at runtime:

```ts
console.log(ctx.user.permissions); // all merged permissions
```

---

## 📚 Types Summary

```ts
type RolePermissionMap<T extends string[]> = Record<string, T[number][]>;
type DenyError<T extends string[]> = {
  error: string;
  message: string;
  permission: T[number];
};
```

---

## 📦 Exported API

```ts
import RBAC, { plugin, authorize } from '@tezx/rbac';
```

---

## 🧪 Test Route Example

```ts
app.get('/secure', rbac.authorize('admin:panel'), async (ctx) => {
  ctx.body = { status: 'Access granted.' };
});
```

---

## ✅ Best Practices

- 🔄 Always assign `ctx.user.role` in `authChecker`
- 🧠 Define permissions centrally as union literal type
- 🔐 Protect all critical routes using `rbac.authorize()`
- 🧪 Add logging inside `onDeny` for better traceability

---
