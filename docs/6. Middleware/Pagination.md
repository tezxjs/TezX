
# 📄 PaginationHandler Middleware

The `paginationHandler` middleware simplifies adding pagination support to your web app. It parses query params, fetches paginated data dynamically, and enriches responses with useful metadata.

---

## Key Features

* ✅ Parses and sanitizes pagination query parameters (`page` & `limit`).
* ✅ Supports dynamic data fetching via customizable data source function.
* ✅ Attaches detailed pagination metadata (`totalPages`, `hasNextPage`, etc.).
* ✅ Configurable defaults, limits, and response keys.
* ✅ Graceful error handling and input validation.

---

## Installation

```ts
import { paginationHandler } from "tezx/pagination";
```

---

## Configuration Options

| Option          | Type                                                                                                             | Default     | Description                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `defaultPage`   | `number`                                                                                                         | `1`         | Default page number if none provided.                         |
| `defaultLimit`  | `number`                                                                                                         | `10`        | Default items per page if none provided.                      |
| `maxLimit`      | `number`                                                                                                         | `100`       | Maximum allowed items per page.                               |
| `queryKeyPage`  | `string`                                                                                                         | `"page"`    | Query param name for page number.                             |
| `queryKeyLimit` | `string`                                                                                                         | `"limit"`   | Query param name for items per page.                          |
| `countKey`      | `string`                                                                                                         | `"total"`   | Key in response containing total item count.                  |
| `dataKey`       | `string`                                                                                                         | `"data"`    | Key in response containing the data array.                    |
| `getDataSource` | `(ctx: Context, pagination: { page: number; limit: number; offset: number }) => Promise<{ [key: string]: any }>` | `undefined` | Function to fetch paginated data and total count dynamically. |

---

## Usage Examples

### Basic Usage: Parsing Pagination Params Only

```ts
app.use(paginationHandler());

app.get("/users", (ctx) => {
  const { page, limit, offset } = ctx.pagination;
  return ctx.json({ message: `Page ${page}, Limit ${limit}, Offset ${offset}` });
});
```

*Request*: `GET /users?page=2&limit=20`

*Response*:

```json
{
  "message": "Page 2, Limit 20, Offset 20"
}
```

---

### Advanced Usage: With Dynamic Data Source

```ts
async function fetchProducts(ctx, { page, limit, offset }) {
  const products = await Product.findAll({ offset, limit });
  const total = await Product.count();
  return { items: products, totalCount: total };
}

app.get(
  "/products",
  paginationHandler({
    defaultPage: 1,
    defaultLimit: 5,
    maxLimit: 50,
    queryKeyPage: "p",
    queryKeyLimit: "size",
    countKey: "totalCount",
    dataKey: "items",
    getDataSource: fetchProducts,
  }),
  (ctx) => ctx.json(ctx.body),
);
```

*Request*: `GET /products?p=2&size=10`

*Response*:

```json
{
  "items": [ /* 10 products */ ],
  "totalCount": 25,
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

---

### Custom Response Keys

```ts
async function fetchUsers(ctx, { page, limit, offset }) {
  const users = await User.findAll({ offset, limit });
  const total = await User.count();
  return { records: users, count: total };
}

app.get(
  "/users",
  paginationHandler({
    countKey: "count",
    dataKey: "records",
    getDataSource: fetchUsers,
  }),
);
```

---

## How It Works

1. Reads `page` and `limit` from query parameters (customizable keys).
2. Sanitizes values: enforces minimum `page = 1`, and `limit <= maxLimit`.
3. Calculates offset = `(page - 1) * limit`.
4. Calls `getDataSource` (if provided) with pagination info.
5. Attaches paginated data and metadata to `ctx.body`.

---

## Pagination Metadata Included

* `page` — current page number
* `limit` — items per page
* `totalItems` — total number of items available
* `totalPages` — total pages calculated
* `hasNextPage` — boolean, if next page exists
* `hasPrevPage` — boolean, if previous page exists
* `nextPage` — next page number or `null`
* `prevPage` — previous page number or `null`

---

## Error Handling

* Invalid or missing `page`/`limit` query params default to configured defaults.
* Limits are clamped to `maxLimit`.
* Missing `getDataSource` means only pagination info is attached; data fetching is manual.

---

## Best Practices

* Set sensible `maxLimit` to prevent excessive data loads.
* Use database-level pagination (`OFFSET`/`LIMIT`) in `getDataSource` for performance.
* Customize response keys to integrate with existing APIs.
* Test edge cases such as empty datasets or out-of-range pages.

---

## Sample Output (Page 3 of 5 items per page, total 13 items)

```json
{
  "items": [ /* last 3 items */ ],
  "totalCount": 13,
  "pagination": {
    "page": 3,
    "limit": 5,
    "totalItems": 13,
    "totalPages": 3,
    "hasNextPage": false,
    "hasPrevPage": true,
    "nextPage": null,
    "prevPage": 2
  }
}
```

---
