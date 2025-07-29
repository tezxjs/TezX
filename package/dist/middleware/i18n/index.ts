import { GlobalConfig } from "../../core/config.js";
import { Context, Middleware } from "../../index.js";
import { getCookie } from "../../utils/cookie.js";

export type TranslationMap = {
    [key: string]: string | TranslationMap; // Support nested translations
};

export type loadTranslations = (language: string) => Promise<{
    translations: TranslationMap;
    expiresAt?: Date | number;
}>;

export type I18nOptions = {
    /**
     * 🌐 Function to load translations dynamically
     * @param language - Language code to load (e.g., "en-US")
     * @returns Promise with translations map and optional expiration
     */

    loadTranslations: (language: string) => Promise<{
        translations: TranslationMap;
        expiresAt?: Date | number; // Date object or milliseconds since epoch
    }>;

    /**
     * ⏱️ Default cache duration in milliseconds
     * @default 3600000 (1 hour)
     */
    defaultCacheDuration?: number;

    /**
     * 🔄 Function to check if cached translations are stale
     * @default Checks expiration time
     * @example
     * isCacheValid: (cached, lang) => {
     *   return cached.expiresAt > Date.now() &&
     *          cached.version === getCurrentVersion(lang);
     * }
     */
    isCacheValid?: (
        cached: { translations: TranslationMap; expiresAt: number },
        language: string,
    ) => boolean;

    /**
     * 🔍 Custom language detection function
     * @default Checks query param → cookie → Accept-Language header → default
     * @example
     * detectLanguage: (ctx) => ctx.cookies.get('user_lang') || 'en'
     */
    detectLanguage?: (ctx: Context) => string;

    /**
     * 🏠 Default fallback language
     * @default "en"
     */
    defaultLanguage?: string;

    /**
     * 🔀 Language fallback chain (most specific to least)
     * @example ["fr-CA", "fr", "en"] // Try Canadian French → French → English
     */
    fallbackChain?: string[];

    /**
     * 🗝️ Context property name for translation function
     * @default "t"
     */
    translationFunctionKey?: string;

    /**
     * 💬 Message formatting function
     * @default Basic template replacement ({{key}})
     * @example
     * formatMessage: (msg, vars) => {
     *   return msg.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
     * }
     */
    formatMessage?: (message: string, options?: Record<string, any>) => string;

    /**
     * 🗃️ Cache loaded translations
     * @default true
     */
    cacheTranslations?: boolean;
};

// Cache store interface
interface TranslationCache {
    [language: string]: {
        translations: TranslationMap;
        expiresAt: number;
    };
}

/**
 * 🌍 Advanced i18n middleware with dynamic loading and fallback support
 *
 * Features:
 * - Hierarchical language resolution
 * - Nested translation keys
 * - Template interpolation
 * - Optional caching
 * - Custom language detection
 *
 * @param {I18nOptions} options - Configuration options
 * @returns {Middleware} Configured middleware
 *
 * @example
 * // Basic usage
 * app.use(i18n({
 *   loadTranslations: lang => import(`./locales/${lang}.json`),
 *   defaultLanguage: 'en'
 * }));
 *
 * // With caching and custom detection
 * app.use(i18n({
 *   loadTranslations: fetchTranslations,
 *   detectLanguage: ctx => ctx.get('X-Language'),
 *   cacheTranslations: true
 * }));
 */
const i18n = (options: I18nOptions): Middleware => {
    const {
        loadTranslations,
        defaultCacheDuration = 3600000, // 1 hour
        isCacheValid = (cached) => cached.expiresAt > Date.now(),
        detectLanguage = (ctx) => {
            if (ctx.req.query.lang) {
                return ctx.req.query.lang;
            }
            else if (getCookie('lang', ctx)) {
                return ctx.cookies?.['lang'];
            }
            else if (ctx.req.header("accept-language")) {
                const lang = ctx.req.header("accept-language")?.split(",")[0];
                if (lang) return lang;
            }
            else if (options.defaultLanguage) {
                return options.defaultLanguage;
            }
            return "en";
        },
        defaultLanguage = "en",
        fallbackChain = [],
        translationFunctionKey = "t",
        formatMessage = (message, options = {}) => {
            return Object.entries(options).reduce(
                (msg, [key, value]) =>
                    msg.replace(new RegExp(`{{${key}}}`, "g"), String(value)),
                message,
            );
        },
        cacheTranslations = true,
    } = options;

    // Translation cache with TTL (1 hour)
    const translationCache: TranslationCache = {};
    // 🧹 Periodic cache cleanup

    // const cleanupInterval = setInterval(() => {
    //     const now = Date.now();
    //     for (const lang in translationCache) {
    //         if (translationCache[lang].expiresAt <= now) {
    //             delete translationCache[lang];
    //         }
    //     }
    // }, 3600000); // Run hourly

    return async function i18n(ctx, next) {
        try {
            const detectedLanguage = detectLanguage(ctx);
            // 1. 🕵️ Detect language with fallback chain
            const languageChain = [
                detectedLanguage,
                ...fallbackChain,
                defaultLanguage,
            ].filter(Boolean) as string[];

            // 2. 🔄 Find first available translations
            let translations: TranslationMap | null = null;
            let selectedLanguage = defaultLanguage;

            for (const lang of languageChain) {
                const normalizedLang = lang.split("-")[0].toLowerCase();

                // Check cache first
                if (cacheTranslations && translationCache[normalizedLang]) {
                    const cached = translationCache[normalizedLang];
                    if (isCacheValid(cached, normalizedLang)) {
                        translations = cached.translations;
                        selectedLanguage = lang;
                        break;
                    }
                    delete translationCache[normalizedLang]; // Remove stale cache
                }

                try {
                    const { translations: loadedTranslations, expiresAt } =
                        await loadTranslations(normalizedLang);

                    // Calculate expiration time
                    let expirationTime = Date.now() + defaultCacheDuration;
                    if (expiresAt instanceof Date) {
                        expirationTime = expiresAt.getTime();
                    } else if (typeof expiresAt === "number") {
                        expirationTime = expiresAt;
                    }

                    translations = loadedTranslations;
                    selectedLanguage = lang;

                    // Update cache
                    if (cacheTranslations) {
                        translationCache[normalizedLang] = {
                            translations,
                            expiresAt: expirationTime,
                            // lastUpdated: Date.now()
                        };
                    }
                    break;
                } catch (error) {
                    GlobalConfig.debugging.warn(
                        `Translation load failed for ${lang}:`,
                        error,
                    );
                }
            }

            if (!translations) {
                throw new Error("No translations available");
            }

            // 3. ✨ Attach translation function to context
            ctx[translationFunctionKey] = (
                key: string,
                options?: Record<string, any>,
            ) => {
                // Handle nested keys (e.g., 'home.header.title')
                const value = key.split(".").reduce((acc, k) => {
                    return acc && typeof acc === "object" ? acc[k] : undefined;
                }, translations as any);

                const message = typeof value === "string" ? value : key;
                return formatMessage(message, options);
            };

            // 4. 🌐 Attach language info
            ctx.language = selectedLanguage;
            ctx.languageChain = languageChain;

            // 5. ⏭️ Proceed with request
            return await next();
        } catch (error) {
            GlobalConfig.debugging.error("i18n processing error:", error);
            ctx.setStatus = 500;
            throw error;
        }
    };
};

export {
    i18n, i18n as default
};