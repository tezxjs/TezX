# 📘 Pagination Middleware (`paginationHandler`)

The `paginationHandler` middleware provides **automatic pagination handling** for API endpoints.
It simplifies extracting pagination parameters, calculating offsets, generating metadata, and optionally integrates with a **dynamic data source** (e.g., database, ORM).

---

## 📦 Import

```ts
// Standard import
import { paginationHandler } from "tezx/middleware";
```

---

## ⚙️ Options

```ts
export type PaginationOptions<
  DataKey extends string = "data",
  CountKey extends string = "total",
  Item = any
> = {
  defaultPage?: number;       // Default page if not specified (default: 1)
  defaultLimit?: number;      // Default items per page (default: 10)
  maxLimit?: number;          // Maximum items per page (default: 100)
  queryKeyPage?: string;      // Query parameter for page (default: "page")
  queryKeyLimit?: string;     // Query parameter for limit (default: "limit")
  countKey?: CountKey;        // Key for total count (default: "total")
  dataKey?: DataKey;          // Key for data array (default: "data")

  getDataSource?: <T extends Record<string, any> = {}>(
    ctx: Context<T>,
    pagination: { page: number; limit: number; offset: number }
  ) => Promise<
    { [K in DataKey]: Item[] } & { [K in CountKey]: number }
  >;
};
```

---

## 📊 Pagination Metadata

When pagination is applied, the following structure is available in `ctx.pagination` and response body:

```ts
type PaginationBodyType = {
  [x: string]: any;
  pagination: {
    page: number;          // Current page number
    limit: number;         // Items per page
    offset: number;        // Calculated offset
    totalItems: number;    // Total number of items
    totalPages: number;    // Total number of pages
    hasNextPage: boolean;  // Whether next page exists
    hasPrevPage: boolean;  // Whether previous page exists
    nextPage: number|null; // Next page number (or null)
    prevPage: number|null; // Previous page number (or null)
  };
};
```

---

## 🚀 Usage Examples

### 1. Basic Setup (No Data Source)

Only extracts pagination parameters and makes them available via `ctx.pagination`.

```ts
import { paginationHandler } from "tezx/middleware";

app.get("/users", paginationHandler(), async (ctx) => {
  const { page, limit, offset } = ctx.pagination;
  ctx.json({ page, limit, offset });
});

// GET /users?page=2&limit=5
// → { "page": 2, "limit": 5, "offset": 5 }
```

---

### 2. With Dynamic Data Source (Database Integration)

Automatically fetches data and total count from your database and returns a **structured response**.

```ts
app.get(
  "/products",
  paginationHandler({
    getDataSource: async (ctx, { page, limit, offset }) => {
      // Example using Sequelize
      const { rows, count } = await Product.findAndCountAll({
        offset,
        limit,
      });
      return { data: rows, total: count };
    },
  })
);

// GET /products?page=2&limit=10
// → {
//   "data": [ ... 10 products ... ],
//   "total": 53,
//   "pagination": {
//     "page": 2,
//     "limit": 10,
//     "offset": 10,
//     "totalItems": 53,
//     "totalPages": 6,
//     "hasNextPage": true,
//     "hasPrevPage": true,
//     "nextPage": 3,
//     "prevPage": 1
//   }
// }
```

---

### 3. Custom Query Keys

Use different query parameter names for pagination.

```ts
app.get(
  "/articles",
  paginationHandler({
    queryKeyPage: "p",
    queryKeyLimit: "size",
  }),
  async (ctx) => {
    const { page, limit } = ctx.pagination;
    ctx.json({ page, limit });
  }
);

// GET /articles?p=3&size=20
// → { "page": 3, "limit": 20 }
```

---

### 4. Custom Data and Count Keys

Return custom response keys for compatibility with frontend clients.

```ts
app.get(
  "/comments",
  paginationHandler({
    dataKey: "items",
    countKey: "totalCount",
    getDataSource: async (ctx, { offset, limit }) => {
      const { rows, count } = await Comment.findAndCountAll({ offset, limit });
      return { items: rows, totalCount: count };
    },
  })
);

// GET /comments?page=1&limit=5
// → {
//   "items": [ ... 5 comments ... ],
//   "totalCount": 42,
//   "pagination": { ... }
// }
```

---

### 5. Strict Maximum Limit

Protect your API by enforcing a **hard max limit**.

```ts
app.get(
  "/logs",
  paginationHandler({
    defaultLimit: 20,
    maxLimit: 50, // Clients cannot request more than 50
  }),
  async (ctx) => {
    ctx.json({ limit: ctx.pagination.limit });
  }
);

// GET /logs?limit=500
// → limit will be capped at 50
```

---

## 🔒 Best Practices

* **Always enforce `maxLimit`** to prevent abuse (e.g., denial-of-service by requesting huge datasets).
* **Use `whitelist` query keys** (`queryKeyPage`, `queryKeyLimit`) for consistency across APIs.
* **Custom response keys (`dataKey`, `countKey`)** make integration smoother with frontend expectations.
* Place `paginationHandler` **before your route handler** so that `ctx.pagination` is available when querying your DB.
* If using `getDataSource`, the middleware automatically sets the response body — otherwise, you can manually use `ctx.pagination`.

---
