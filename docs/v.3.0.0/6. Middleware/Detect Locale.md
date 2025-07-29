
# `detectLocale` Middleware

## Overview

The `detectLocale` middleware detects and sets a user’s preferred locale in web applications. It supports detection via query parameters, cookies, `Accept-Language` headers, and custom logic. The detected locale is attached to the request context, enabling localized responses downstream.

Built with TypeScript, it works seamlessly across Node.js, Bun, and Deno runtimes.

---

## Configuration Options

| Option                 | Type                                    | Description                                                       | Default    | Required |
| ---------------------- | --------------------------------------- | ----------------------------------------------------------------- | ---------- | -------- |
| `supportedLocales`     | `string[]`                              | Allowed locale codes (e.g., `["en", "fr", "bn"]`).                | —          | Yes      |
| `defaultLocale`        | `string`                                | Fallback locale if detection fails.                               | `"en"`     | No       |
| `queryKeyLocale`       | `string`                                | Query parameter key for locale (e.g., `lang` in `/?lang=fr`).     | `"lang"`   | No       |
| `cookieKeyLocale`      | `string`                                | Cookie name storing locale preference.                            | `"locale"` | No       |
| `localeContextKey`     | `string`                                | Context key where detected locale is stored (e.g., `ctx.locale`). | `"locale"` | No       |
| `customLocaleDetector` | `(ctx: Context) => string \| undefined` | Custom function for programmatic locale detection.                | —          | No       |

---

## Middleware Detection Workflow

1. **Query Parameter:** Checks for locale in the query string and validates against `supportedLocales`.
2. **Cookie:** Looks for locale cookie, validating the value.
3. **Accept-Language Header:** Parses and selects the first matching locale from the header.
4. **Custom Detector:** If provided, invokes the custom function for locale detection.
5. **Fallback:** Defaults to `defaultLocale` if no valid locale is found.

Finally, the detected locale is assigned to `ctx[localeContextKey]`, and the middleware proceeds by calling `next()`.

---

## Usage Examples

### 1. Query Parameter Detection

```ts
import { detectLocale } from "tezx/detect-locale";

app.get(
  "/welcome",
  detectLocale({ supportedLocales: ["en", "fr", "bn"], queryKeyLocale: "lang" }),
  (ctx) => {
    return ctx.json({
      message: {
        en: "Welcome!",
        fr: "Bienvenue !",
        bn: "স্বাগতম!",
      }[ctx.locale],
    });
  }
);
```

---

### 2. Cookie-Based Detection

```ts
app.get(
  "/welcome",
  detectLocale({ supportedLocales: ["en", "fr", "bn"], cookieKeyLocale: "locale" }),
  (ctx) => {
    return ctx.json({ message: { en: "Welcome!", fr: "Bienvenue !", bn: "স্বাগতম!" }[ctx.locale] });
  }
);
```

---

### 3. Accept-Language Header Detection

```ts
app.get(
  "/welcome",
  detectLocale({ supportedLocales: ["en", "fr", "bn"] }),
  (ctx) => {
    return ctx.json({ message: { en: "Welcome!", fr: "Bienvenue !", bn: "স্বাগতম!" }[ctx.locale] });
  }
);
```

---

### 4. Custom Locale Detector

```ts
const localeMiddleware = detectLocale({
  supportedLocales: ["en", "fr", "bn"],
  customLocaleDetector: (ctx) => {
    const userId = ctx.req.headers.get("x-user-id");
    const userLocales = { user123: "bn" };
    return userLocales[userId] || undefined;
  },
});
```

---

### 5. Default Locale Fallback

```ts
detectLocale({
  supportedLocales: ["en", "fr", "bn"],
  defaultLocale: "fr",
});
```

---

### 6. Custom Context Key and Combining All

```ts
detectLocale({
  supportedLocales: ["en", "fr", "bn"],
  defaultLocale: "en",
  queryKeyLocale: "language",
  cookieKeyLocale: "user_locale",
  localeContextKey: "userLocale",
  customLocaleDetector: (ctx) => {
    // Your logic here
  },
});
```

---

## Best Practices

* Ensure `supportedLocales` covers all locales your app supports.
* Use consistent and clear names for keys (`queryKeyLocale`, `cookieKeyLocale`, `localeContextKey`).
* Implement `customLocaleDetector` for complex scenarios like DB lookups or geolocation.
* Enable logging/debugging during development to troubleshoot detection.
* Secure cookies storing locale preferences (HTTP-only, Secure flags).
* Handle malformed or complex `Accept-Language` headers gracefully.

---

## Error Handling and Robustness

* Unsupported or invalid query param and cookie values are ignored.
* Malformed `Accept-Language` headers are safely filtered.
* Invalid results from custom detectors fall back to `defaultLocale`.
* Always guarantees a valid locale is set in context.

---

## Type Definitions

```ts
type DetectLocaleOptions = {
  supportedLocales: string[];
  defaultLocale?: string;
  queryKeyLocale?: string;
  cookieKeyLocale?: string;
  localeContextKey?: string;
  customLocaleDetector?: (ctx: Context) => string | undefined;
};

declare function detectLocale(options: DetectLocaleOptions): Middleware;
```

---
