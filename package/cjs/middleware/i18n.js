"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.default = void 0;
const i18n = (options) => {
    const { loadTranslations, defaultCacheDuration = 3600000, detectLanguage, defaultLanguage = "en", translationFunctionKey = "t", formatMessage = (msg, vars = {}) => {
        if (vars && msg.indexOf("{{") !== -1) {
            let out = "";
            let i = 0;
            while (i < msg.length) {
                const startVar = msg.indexOf("{{", i);
                if (startVar === -1) {
                    out += msg.slice(i);
                    break;
                }
                const endVar = msg.indexOf("}}", startVar + 2);
                if (endVar === -1) {
                    out += msg.slice(i);
                    break;
                }
                out += msg.slice(i, startVar);
                const keyVar = msg.slice(startVar + 2, endVar).trim();
                out += vars[keyVar] !== undefined ? String(vars[keyVar]) : "";
                i = endVar + 2;
            }
            return out;
        }
        return msg;
    }, isCacheValid = (cached) => cached.expiresAt > Date.now(), cacheTranslations = false, cacheStorage: externalCache = null, } = options;
    let localCache = null;
    if (cacheTranslations && !externalCache)
        localCache = new Map();
    return async function i18n(ctx, next) {
        try {
            const lang = detectLanguage(ctx) ?? defaultLanguage;
            let translations = undefined;
            if (cacheTranslations) {
                if (externalCache) {
                    const cached = await externalCache.get(lang);
                    if (cached && isCacheValid(cached, lang))
                        translations = cached.translations;
                }
                else if (localCache?.get(lang)) {
                    const cached = localCache.get(lang);
                    if (isCacheValid(cached, lang))
                        translations = cached.translations;
                    else
                        localCache.delete(lang);
                }
            }
            if (!translations) {
                translations = await loadTranslations(lang);
                const expiresAt = Date.now() + defaultCacheDuration;
                if (cacheTranslations) {
                    if (externalCache) {
                        await externalCache.set(lang, { translations, expiresAt });
                    }
                    else {
                        localCache?.set(lang, { translations, expiresAt });
                    }
                }
            }
            ctx[translationFunctionKey] = function translate(key, vars) {
                let acc = translations;
                let start = 0;
                for (let i = 0; i <= key.length; i++) {
                    const c = key.charCodeAt(i);
                    if (c === 46 || i === key.length) {
                        const segment = key.slice(start, i);
                        if (acc && typeof acc === "object") {
                            acc = acc[segment];
                        }
                        else {
                            acc = undefined;
                            break;
                        }
                        start = i + 1;
                    }
                }
                let msg = typeof acc === "string" ? acc : key;
                return formatMessage(msg, vars);
            };
            ctx.language = lang;
            return await next();
        }
        catch (error) {
            ctx.status(500);
            let err = error instanceof Error ? error : new Error(error);
            throw err;
        }
    };
};
exports.default = i18n;
exports.i18n = i18n;
