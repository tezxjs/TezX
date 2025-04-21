import { Context, Middleware } from "../index.js";
export type TranslationMap = {
  [key: string]: string | TranslationMap;
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
    expiresAt?: Date | number;
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
    cached: {
      translations: TranslationMap;
      expiresAt: number;
    },
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
 * app.use(i18nMiddleware({
 *   loadTranslations: lang => import(`./locales/${lang}.json`),
 *   defaultLanguage: 'en'
 * }));
 *
 * // With caching and custom detection
 * app.use(i18nMiddleware({
 *   loadTranslations: fetchTranslations,
 *   detectLanguage: ctx => ctx.get('X-Language'),
 *   cacheTranslations: true
 * }));
 */
export declare const i18nMiddleware: (options: I18nOptions) => Middleware;
