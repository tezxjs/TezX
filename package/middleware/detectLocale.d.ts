import { Context, Middleware } from "../index.js";
/**
 * Options for the detectLocale middleware.
 */
export type DetectLocaleOptions = {
  /**
   * 🌐 List of allowed locales.
   * e.g., ["en", "fr", "bn"]
   */
  supportedLocales: string[];
  /**
   * 🏠 Default locale if none is matched from query, cookie, or headers.
   * @default "en"
   */
  defaultLocale?: string;
  /**
   * 🔍 Name of the query parameter to check for locale.
   * Example: /?lang=fr
   * @default "lang"
   */
  queryKeyLocale?: string;
  /**
   * 🍪 Name of the cookie used to store locale preference.
   * @default "locale"
   */
  cookieKeyLocale?: string;
  /**
   * 🗺️ Key under which the locale will be attached to the context object.
   * Example: ctx.locale = "en"
   * @default "locale"
   */
  localeContextKey?: string;
  /**
   * 🛠️ Optional custom function to programmatically detect locale.
   * Called last before fallback.
   * Should return a supported locale or undefined.
   */
  customLocaleDetector?: (ctx: Context) => string | undefined;
};
/**
 * 🌍 Middleware that detects and sets the user's preferred locale.
 *
 * Detection order:
 * 1. Query parameter (e.g., ?lang=fr)
 * 2. Cookie value (e.g., locale=fr)
 * 3. Accept-Language HTTP header
 * 4. Custom detector function (if provided)
 * 5. Default locale (fallback)
 *
 * The detected locale is stored in `ctx[localeContextKey]`.
 *
 * @param options - Configuration options for locale detection.
 * @returns Middleware function that attaches locale to the context.
 */
export declare const detectLocale: (options: DetectLocaleOptions) => Middleware;
