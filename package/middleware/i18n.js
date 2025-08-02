import { GlobalConfig } from "../core/config.js";
import { getCookie } from "../utils/cookie.js";
const i18n = (options) => {
    const { loadTranslations, defaultCacheDuration = 3600000, isCacheValid = (cached) => cached.expiresAt > Date.now(), detectLanguage = (ctx) => {
        if (ctx.req.query.lang) {
            return ctx.req.query.lang;
        }
        else if (getCookie(ctx, "lang")) {
            return ctx.cookies?.["lang"];
        }
        else if (ctx.req.header("accept-language")) {
            const lang = ctx.req.header("accept-language")?.split(",")[0];
            if (lang)
                return lang;
        }
        else if (options.defaultLanguage) {
            return options.defaultLanguage;
        }
        return "en";
    }, defaultLanguage = "en", fallbackChain = [], translationFunctionKey = "t", formatMessage = (message, options = {}) => {
        return Object.entries(options).reduce((msg, [key, value]) => msg.replace(new RegExp(`{{${key}}}`, "g"), String(value)), message);
    }, cacheTranslations = true, } = options;
    const translationCache = {};
    return async function i18n(ctx, next) {
        try {
            const detectedLanguage = detectLanguage(ctx);
            const languageChain = [
                detectedLanguage,
                ...fallbackChain,
                defaultLanguage,
            ].filter(Boolean);
            let translations = null;
            let selectedLanguage = defaultLanguage;
            for (const lang of languageChain) {
                const normalizedLang = lang.split("-")[0].toLowerCase();
                if (cacheTranslations && translationCache[normalizedLang]) {
                    const cached = translationCache[normalizedLang];
                    if (isCacheValid(cached, normalizedLang)) {
                        translations = cached.translations;
                        selectedLanguage = lang;
                        break;
                    }
                    delete translationCache[normalizedLang];
                }
                try {
                    const { translations: loadedTranslations, expiresAt } = await loadTranslations(normalizedLang);
                    let expirationTime = Date.now() + defaultCacheDuration;
                    if (expiresAt instanceof Date) {
                        expirationTime = expiresAt.getTime();
                    }
                    else if (typeof expiresAt === "number") {
                        expirationTime = expiresAt;
                    }
                    translations = loadedTranslations;
                    selectedLanguage = lang;
                    if (cacheTranslations) {
                        translationCache[normalizedLang] = {
                            translations,
                            expiresAt: expirationTime,
                        };
                    }
                    break;
                }
                catch (error) {
                    GlobalConfig.debugging.warn(`Translation load failed for ${lang}:`, error);
                }
            }
            if (!translations) {
                throw new Error("No translations available");
            }
            ctx[translationFunctionKey] = (key, options) => {
                const value = key.split(".").reduce((acc, k) => {
                    return acc && typeof acc === "object" ? acc[k] : undefined;
                }, translations);
                const message = typeof value === "string" ? value : key;
                return formatMessage(message, options);
            };
            ctx.language = selectedLanguage;
            ctx.languageChain = languageChain;
            return await next();
        }
        catch (error) {
            GlobalConfig.debugging.error("i18n processing error:", error);
            ctx.setStatus = 500;
            throw error;
        }
    };
};
export { i18n, i18n as default };
