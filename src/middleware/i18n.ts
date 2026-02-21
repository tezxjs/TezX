import { Context, Middleware } from "../index.js";

export type TranslationMap = {
  [key: string]: string | TranslationMap;
};

export type loadTranslations = (language: string) => Promise<TranslationMap>;

/**
 * 📦 Interface defining a pluggable cache adapter for i18n translations.
 *
 * You can implement this interface to provide custom caching logic —
 * for example, in-memory, Redis, file-based, or distributed cache.
 *
 * @example
 * ```ts
 * const redisCache: I18nCacheAdapter = {
 *   async get(lang) {
 *     const data = await redis.get(`i18n:${lang}`);
 *     return data ? JSON.parse(data) : null;
 *   },
 *   async set(lang, data) {
 *     await redis.set(`i18n:${lang}`, JSON.stringify(data), 'PX', data.expiresAt - Date.now());
 *   },
 *   async delete(lang) {
 *     await redis.del(`i18n:${lang}`);
 *   }
 * };
 * ```
 */
export interface I18nCacheAdapter {
  /**
   * Retrieve cached translations for a specific language.
   *
   * @param lang - The language code (e.g., `"en"`, `"bn"`, `"fr"`)
   * @returns A Promise resolving to the cached translations object
   *          or `null` if not available or expired.
   */
  get(
    lang: string,
  ): Promise<{ translations: TranslationMap; expiresAt: number } | null>;

  /**
   * Store translations in cache for a specific language.
   *
   * @param lang - The language code (e.g., `"en"`, `"es"`)
   * @param data - An object containing the translation map and expiration timestamp.
   * @returns A Promise that resolves when caching is complete.
   */
  set(
    lang: string,
    data: { translations: TranslationMap; expiresAt: number },
  ): Promise<void>;

  /**
   * Remove cached translations for a specific language.
   *
   * @param lang - The language code to delete.
   * @returns A Promise that resolves when deletion is complete.
   */
  delete(lang: string): Promise<void>;
}

/**
 * ⚙️ Configuration options for the TezX i18n middleware.
 *
 * This configuration provides flexibility for:
 * - dynamic translation loading
 * - custom caching strategies
 * - language detection logic
 * - message formatting and interpolation
 *
 * @example
 * ```ts
 * app.use(i18n({
 *   loadTranslations: lang => import(`./locales/${lang}.json`),
 *   detectLanguage: ctx => ctx.req.query.lang || 'en',
 *   cacheTranslations: true,
 *   cacheStorage: redisCache,
 *   defaultLanguage: 'en',
 *   formatMessage: (msg, vars) => msg.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k])
 * }));
 * ```
 */
export type I18nOptions = {
  /**
   * 🌐 Function responsible for loading translation data dynamically.
   *
   * This can load translations from local JSON, database, API, etc.
   *
   * @param language - Language code to load (e.g., `"en"`, `"bn-BD"`)
   * @returns Promise resolving to translation map for that language.
   */
  loadTranslations: loadTranslations;

  /**
   * ⏱️ Default cache duration in milliseconds.
   *
   * Defines how long translations remain valid before reloading.
   *
   * @default 3600000 (1 hour)
   */
  defaultCacheDuration?: number;

  /**
   * 🔍 Function to detect the preferred user language.
   *
   * Determines language priority from request context.
   * Common strategies include:
   * - URL query parameter
   * - Cookie
   * - HTTP `Accept-Language` header
   *
   * @example
   * detectLanguage: (ctx) => ctx.req.query.lang || ctx.cookies.lang || 'en'
   */
  detectLanguage: (ctx: Context) => string;

  /**
   * 🏠 Default fallback language.
   *
   * Used when detected language translations are unavailable.
   *
   * @default "en"
   */
  defaultLanguage?: string;

  /**
   * 🗝️ Context property key where the translation function (`t`) is attached.
   *
   * @default "t"
   * @example
   * ```ts
   * ctx.t("greeting.hello");
   * ctx.t("user.welcome", { name: "Rakibul" });
   * ```
   */
  translationFunctionKey?: string;

  /**
   * 💬 Custom message formatting function.
   *
   * Handles variable interpolation (e.g., replacing `{{name}}` with actual value).
   * You can override this for advanced templating logic.
   *
   * @param message - The base translation string.
   * @param vars - Optional variable map for placeholders.
   * @returns Formatted string with variables replaced.
   *
   * @default
   * ```ts
   * (msg, vars = {}) =>
   *   Object.entries(vars).reduce(
   *     (m, [k, v]) => m.replace(new RegExp(`{{${k}}}`, "g"), String(v)),
   *     msg
   *   );
   * ```
   */
  formatMessage?: (message: string, vars?: Record<string, any>) => string;

  /**
   * 🔒 Custom cache validation logic.
   *
   * Checks whether cached translations are still valid.
   *
   * @param cached - Cached object with translations and expiry timestamp.
   * @param lang - The language being validated.
   * @returns `true` if cache is valid, otherwise `false`.
   *
   * @default
   * ```ts
   * (cached) => cached.expiresAt > Date.now()
   * ```
   */
  isCacheValid?: (
    cached: { translations: TranslationMap; expiresAt: number },
    lang: string,
  ) => boolean;

  /**
   * 🗃️ Whether to enable caching for translations.
   *
   * If disabled, translations are always loaded fresh.
   *
   * @default false
   */
  cacheTranslations?: boolean;

  /**
   * 💾 Optional external cache adapter for distributed or persistent caching.
   *
   * Supports any system implementing `I18nCacheAdapter` interface —
   * such as Redis, filesystem, in-memory store, or custom backends.
   *
   * @example
   * ```ts
   * app.use(i18n({
   *   loadTranslations,
   *   cacheTranslations: true,
   *   cacheStorage: redisCache
   * }));
   * ```
   */
  cacheStorage?: I18nCacheAdapter;
};

const i18n = <T extends Record<string, any> = {}, Path extends string = any>(options: I18nOptions): Middleware<T, Path> => {
  const {
    loadTranslations,
    defaultCacheDuration = 3600000, // 1 hour
    detectLanguage,
    defaultLanguage = "en",
    translationFunctionKey = "t",
    formatMessage = (msg, vars = {}) => {
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
    },
    isCacheValid = (cached) => cached.expiresAt > Date.now(),
    cacheTranslations = false,
    cacheStorage: externalCache = null,
  } = options;

  let localCache: Map<
    string,
    { translations: TranslationMap; expiresAt: number }
  > | null = null;
  if (cacheTranslations && !externalCache) localCache = new Map();

  return async function i18n(ctx, next) {
    try {
      const lang = detectLanguage(ctx) ?? defaultLanguage;

      let translations: TranslationMap | undefined = undefined;

      // 🗃️ Try cache first (external → local)
      if (cacheTranslations) {
        if (externalCache) {
          const cached = await externalCache.get(lang);
          if (cached && isCacheValid(cached, lang))
            translations = cached.translations;
        } else if (localCache?.get(lang)) {
          const cached = localCache.get(lang)!;
          if (isCacheValid(cached, lang)) translations = cached.translations;
          else localCache.delete(lang);
        }
      }

      // 🌐 If not cached, load from source
      if (!translations) {
        translations = await loadTranslations(lang);

        const expiresAt = Date.now() + defaultCacheDuration;
        if (cacheTranslations) {
          if (externalCache) {
            await externalCache.set(lang, { translations, expiresAt });
          } else {
            localCache?.set(lang, { translations, expiresAt });
          }
        }
      }
      (ctx as any)[translationFunctionKey] = function translate(
        key: string,
        vars?: Record<string, any>,
      ) {
        let acc: any = translations;
        let start = 0;
        for (let i = 0; i <= key.length; i++) {
          const c = key.charCodeAt(i);
          if (c === 46 /* '.' */ || i === key.length) {
            const segment = key.slice(start, i);
            if (acc && typeof acc === "object") {
              acc = acc[segment];
            } else {
              acc = undefined;
              break;
            }
            start = i + 1;
          }
        }
        let msg: string = typeof acc === "string" ? acc : key;
        // Optional variable interpolation (inline, no regex)
        return formatMessage(msg, vars);
      };
      (ctx as any).language = lang;
      return await next();
    }
    catch (error: any) {
      ctx.status(500);
      let err = error instanceof Error ? error : new Error(error);
      throw err;
    }
  };
};

export { i18n as default, i18n };
