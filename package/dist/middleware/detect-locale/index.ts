import { GlobalConfig } from "../../core/config.js";
import { Context, Middleware } from "../../index.js";

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
const detectLocale = (options: DetectLocaleOptions): Middleware => {
    const {
        supportedLocales,
        defaultLocale = "en",
        queryKeyLocale = "lang",
        cookieKeyLocale = "locale",
        localeContextKey = "locale",
        customLocaleDetector,
    } = options;

    return async function detectLocale(ctx, next) {
        let detectedLocale: string | undefined;
        // Step 1: Check query parameter
        const queryLocale = ctx.req.query[queryKeyLocale];

        if (queryLocale && supportedLocales.includes(queryLocale)) {
            detectedLocale = queryLocale;
        }

        // Step 2: Check cookies
        if (!detectedLocale) {
            const cookieLocale = ctx.cookies.get(cookieKeyLocale);
            if (cookieLocale && supportedLocales.includes(cookieLocale)) {
                detectedLocale = cookieLocale;
            }
        }

        // Step 3: Check Accept-Language header
        if (!detectedLocale) {
            const acceptLanguage = ctx.req.header("accept-language");
            if (acceptLanguage) {
                const preferredLocales = acceptLanguage
                    .split(",")
                    .map((lang) => lang.split(";")[0].trim())
                    .filter((lang) => supportedLocales.includes(lang));
                detectedLocale = preferredLocales[0];
            }
        }

        // Step 4: Check custom locale detector
        if (!detectedLocale && customLocaleDetector) {
            const customLocale = customLocaleDetector(ctx);
            if (customLocale && supportedLocales.includes(customLocale)) {
                detectedLocale = customLocale;
            }
        }

        // Step 5: Fall back to default locale
        if (!detectedLocale) {
            detectedLocale = defaultLocale;
        }

        // Attach the detected locale to the context
        ctx[localeContextKey] = detectedLocale;

        GlobalConfig.debugging.success(`Detected locale: ${detectedLocale}`);

        // Proceed to the next middleware
        return await next();
    };
};

export {
    detectLocale, detectLocale as default,
}