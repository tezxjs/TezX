# @tezx/validate

**Schema validation middleware for TezX framework**.
Supports Zod, AJV, Joi, or any custom schema adapter. Automatically parses request data (`body`, `query`, `params`) and sets `ctx.validated` for downstream handlers.

---

## Features

* Works with **TezX** middleware.
* Supports **async validation**.
* Compatible with **Zod**, **AJV**, **Joi**, or any custom adapter.
* Optional **error handler** for validation failures.
* Optional **data transformation** after validation.
* Supports parsing of `json`, `text`, or `formData` request bodies.

---

## Installation

```bash
npm install @tezx/validate
# or
yarn add @tezx/validate
```

---

## Usage

### Import

```ts
import { validate, SchemaAdapter } from "@tezx/validate";
import { z } from "zod"; // or import AJV/Joi
```

---

## Basic Example with Zod

```ts
const userSchema: SchemaAdapter = {
  validate: async (data) =>
    z.object({
      username: z.string().min(3),
      password: z.string().min(6)
    }).parseAsync(data)
};

app.use(
  "/login",
  validate({ adapter: userSchema }),
  (ctx) => {
    // ctx.validated contains validated data
    ctx.json({ success: true, user: ctx.validated });
  }
);
```

---

## Using AJV

```ts
import Ajv from "ajv";

const ajv = new Ajv();
const schema = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 6 }
  },
  required: ["username", "password"],
  additionalProperties: false
};

const ajvAdapter: SchemaAdapter = {
  validate: async (data) => {
    const valid = ajv.validate(schema, data);
    if (!valid) throw new Error(JSON.stringify(ajv.errors));
    return data;
  }
};

app.use("/login", validate({ adapter: ajvAdapter }));
```

---

## Using Joi

```ts
import Joi from "joi";

const joiSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required()
});

const joiAdapter: SchemaAdapter = {
  validate: async (data) => {
    const { error, value } = joiSchema.validate(data);
    if (error) throw error;
    return value;
  }
};

app.use("/login", validate({ adapter: joiAdapter }));
```

---

## Options

| Option      | Type                                         | Default | Description                                   |          |                                |
| ----------- | -------------------------------------------- | ------- | --------------------------------------------- | -------- | ------------------------------ |
| `adapter`   | `SchemaAdapter`                              | —       | Schema validator implementation               |          |                                |
| `onError`   | `(err: TezXError, ctx: Context) => Response` | —       | Custom error handler                          |          |                                |
| `source`    | `"body"                                      | "query" | "params"`                                     | `"body"` | Source of data to validate     |
| `transform` | `(data: any) => any`                         | —       | Optional function to transform validated data |          |                                |
| `parseBody` | `"json"                                      | "text"  | "formData"`                                   | `"json"` | Parser method for request body |

---

## Error Handling

By default, `validate` will throw a `TezXError` with **status 400** on validation failure. You can provide `onError` to customize the response:

```ts
validate({
  adapter: userSchema,
  onError: (err, ctx) => ctx.json({ success: false, message: err.message }, 422)
});
```

---

## TypeScript Support

`ctx.validated` is automatically typed as `any`, but you can narrow it by providing generic types:

```ts
validate<{ username: string; password: string }>({
  adapter: userSchema
});
```

---

## Custom Adapters

You can implement any schema library by creating a simple adapter:

```ts
const customAdapter: SchemaAdapter = {
  validate: async (data) => {
    if (!data.username) throw new Error("Missing username");
    return data;
  }
};

app.use(validate({ adapter: customAdapter }));
```

---

## Notes

* Works on **Node.js**, **Bun**, and **Edge** runtimes.
* Can validate `body`, `query`, or `params`.
* Supports **async schema validation**.
* Integrates seamlessly with **TezX middleware**.

---
