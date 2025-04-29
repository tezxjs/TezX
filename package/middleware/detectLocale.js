import { GlobalConfig } from "../core/config.js";
export const detectLocale = (options) => {
  const {
    supportedLocales,
    defaultLocale = "en",
    queryKeyLocale = "lang",
    cookieKeyLocale = "locale",
    localeContextKey = "locale",
    customLocaleDetector,
  } = options;
  return async (ctx, next) => {
    let detectedLocale;
    const queryLocale = ctx.req.query[queryKeyLocale];
    if (queryLocale && supportedLocales.includes(queryLocale)) {
      detectedLocale = queryLocale;
    }
    if (!detectedLocale) {
      const cookieLocale = ctx.cookies.get(cookieKeyLocale);
      if (cookieLocale && supportedLocales.includes(cookieLocale)) {
        detectedLocale = cookieLocale;
      }
    }
    if (!detectedLocale) {
      const acceptLanguage = ctx.req.headers.get("accept-language");
      if (acceptLanguage) {
        const preferredLocales = acceptLanguage
          .split(",")
          .map((lang) => lang.split(";")[0].trim())
          .filter((lang) => supportedLocales.includes(lang));
        detectedLocale = preferredLocales[0];
      }
    }
    if (!detectedLocale && customLocaleDetector) {
      const customLocale = customLocaleDetector(ctx);
      if (customLocale && supportedLocales.includes(customLocale)) {
        detectedLocale = customLocale;
      }
    }
    if (!detectedLocale) {
      detectedLocale = defaultLocale;
    }
    ctx[localeContextKey] = detectedLocale;
    GlobalConfig.debugging.success(`Detected locale: ${detectedLocale}`);
    return await next();
  };
};
